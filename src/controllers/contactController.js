import emailService from "../helper/emailService.js"

class ContactController {

    static async submitContactForm(req, res) {
        try {
            const { name, email, phone, subject, message } = req.body;

            // if (!name || !email) {
            //     return res.status(400).json({
            //         success: false,
            //         message: 'Name, email are required fields'
            //     });
            // }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }

            const phoneRegex = /^[\d\s+\-()]+$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid phone number'
                });
            }

            const contactData = {
                name,
                email,
                phone,
                subject,
                message,
                submittedAt: new Date()
            };

            await emailService.sendContactSupportMail(contactData);

            console.log('Contact Form Submission:', contactData);

            return res.status(200).json({
                success: true,
                message: 'Thank you for contacting Karrivo! Our support team will reach out soon.'
            });

        } catch (error) {
            console.error('Error processing contact form:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while processing your request. Please try again later.'
            });
        }
    }
}

export default ContactController;


