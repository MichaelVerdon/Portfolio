import React from 'react';
import { Col } from 'react-bootstrap';

const ContactCard = ({ Contact }) => {

    const redirectLink = () => {
        window.open(Contact.link)
    }
    return(
        <>
            <Col>
                <div className="contactContainer">
                <img src={
                        Contact.img !== "N/A" 
                        ? Contact.img
                        : 'https://via.placeholder.com/400'
                        } alt="contact" onClick={redirectLink}
                        className='contactImg'/>
                </div>
            </Col>
        </>
    )
} 

export default ContactCard;