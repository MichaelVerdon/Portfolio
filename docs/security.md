# Security

The site is static: Vite builds HTML, JS and images, and AWS Amplify serves them
from its CloudFront CDN. There is no server or API of our own, so there is
nothing in the app code to rate limit. Protection lives at the edge instead.

## What is in the repo

| Protection | Where | Cost |
| --- | --- | --- |
| Security headers (CSP, HSTS, no framing, no sniffing) | `customHttp.yml` | Free |
| Tests and build before every deploy | `amplify.yml` | Free |
| Dependency audit fails CI on high or critical issues | `.github/workflows/ci.yml` | Free |
| Weekly dependency update PRs | `.github/dependabot.yml` | Free |

CloudFront also gets AWS Shield Standard automatically, which absorbs the
common network-level (layer 3/4) floods at no charge.

### Adding a new third-party resource

The Content-Security-Policy in `customHttp.yml` only allows this site plus
Google Fonts. If you add analytics, an embed, a new CDN or an external API,
add its origin to the matching directive (`script-src`, `connect-src`,
`img-src`, `frame-src`...) or the browser will block it. Check the browser
console after deploying: CSP blocks show up there.

## Rate limiting with AWS WAF (needs your AWS account)

Layer 7 floods (lots of HTTP requests from a few IPs) are handled by AWS WAF.
Amplify can attach a WAF web ACL to the app.

### Cost

* Amplify firewall integration: **$15 per month** per app, prorated hourly.
* AWS WAF on top: **$5/month** per web ACL, **$1/month** per rule or managed
  rule group, **$0.60 per million requests** inspected.
* For this site, with the Amplify-recommended protections (about 3 managed
  rule groups) plus one rate-based rule and low traffic, expect roughly
  **$24 to $25 a month**.

Sources: [Amplify firewall pricing](https://docs.aws.amazon.com/amplify/latest/userguide/waf-pricing.html),
[AWS WAF pricing](https://aws.amazon.com/waf/pricing/).

### Steps

1. Open the [Amplify console](https://console.aws.amazon.com/amplify/), choose
   the portfolio app, then **Hosting > Firewall** (app settings).
2. Turn on **Amplify-recommended firewall protection**. This adds AWS managed
   rules for common exploits, known bad inputs and Amazon's IP reputation list.
3. If the site uses a custom domain, also turn on **Restrict access to
   amplifyapp.com** so bots can't bypass the rules via the default domain.
   Skip this if you still visit the site on `*.amplifyapp.com`.
4. Save. Amplify creates a web ACL in your account.
5. Open the [AWS WAF console](https://console.aws.amazon.com/wafv2/), set the
   region selector to **Global (CloudFront)**, and open the web ACL Amplify
   created.
6. **Rules > Add rules > Add my own rules and rule groups**, then:
   * Rule type: **Rule builder**, name `rate-limit-per-ip`, type **Rate-based rule**.
   * Rate limit: **300**, evaluation window: **5 minutes** (300 seconds).
     A real visitor loads the site in well under 50 requests, so 300 per
     5 minutes per IP leaves plenty of room and still cuts off floods.
   * Request aggregation: **Source IP address**.
   * Scope of inspection: **Consider all requests**.
   * Action: **Block** (or **Count** for a day first, to watch what it would
     block under *Sampled requests* before switching to Block).
7. Set the rule's priority so it runs **first**, then **Save**.
8. Test: load the site normally and check nothing is blocked. To see the rule
   fire, run from your own machine (it blocks only your IP for a few minutes):

   ```sh
   for i in $(seq 1 400); do curl -s -o /dev/null -w "%{http_code}\n" https://YOUR-DOMAIN/; done | sort | uniq -c
   ```

   You should see `403` responses once you pass the limit.

### Turning it off

Amplify console > **Firewall** > turn the protections off, then delete the web
ACL in the WAF console. Billing stops (prorated hourly).
