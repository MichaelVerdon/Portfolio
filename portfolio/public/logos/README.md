# Story logos

The 3D story builds each career step's logo out of cubes, in the logo's own colours. Put the files here with these names (set in `src/data/about.json`, `"logo"` on each timeline step):

| File | Step |
| --- | --- |
| `portsmouth.png` | University of Portsmouth |
| `makers.png` | Makers Academy |
| `invertase.png` | Invertase (mark only, cropped from the logo Michael shared) |
| `jpmorgan.png` | JP Morgan (octagon symbol only) |

- SVG or PNG both work. Use a transparent background, or a plain one: the top-left pixel's colour is treated as background.
- The symbol or mark works better than a long wordmark: the logo is drawn about 30 to 40 cubes across, so small text won't read.
- Black and grey parts are drawn in soft white, and very dark colours are lifted, so they show on the black page.
- If a file is missing or fails to load, that step shows its abstract shape instead (`"scene"`).
