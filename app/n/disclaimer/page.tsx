import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'If you require any more information or have any questions about the disclaimer of our site, please feel free to contact us by email at contact@visitpowerful.com',
}

const Disclaimer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <h1><strong> Disclaimer for Powerful</strong></h1>

      <p>If you require any more information or have any questions about the disclaimer of our site, please feel free to contact us by email at contact@visitpowerful.com. Our Disclaimer was generated with the help of the <a href="https://www.disclaimergenerator.net/">Free Disclaimer Generator</a>.</p> <br />

      <h2><strong>Disclaimers for Powerful</strong></h2>

      <p>All the information on this website - https://visitpowerful.com - is published in good faith and for general information purposes only. Powerful does not make any warranties about the completeness, reliability, and accuracy of this information. Any action you take upon the information you find on this website (Powerful) is strictly at your own risk. Powerful will not be liable for any losses and/or damages in connection with the use of our website.</p><br />

      <p>From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone bad.</p> <br />

      <p>Please be also aware that when you leave our website, other sites may have different privacy policies and terms which are beyond our control. Please be sure to check the Privacy Policies of these sites as well as their Terms of Service before engaging in any business or uploading any information.</p><br />

      <h2><strong>Consent</strong></h2>

      <p>By using our website, you hereby consent to our disclaimer and agree to its terms.</p> <br />

      {/* <section>
        <h2><strong>Content Disclaimer</strong></h2><br />
        <p>
          The conceptual artworks of celebrities you see on our platform are <strong>generated using artificial intelligence</strong>. These images are designed for entertainment and creative expression. They do not reflect any personal or professional affiliation with the depicted individuals.
        </p><br />
        <p>
          If any party has an issue with the images, we encourage them to <strong>contact us directly</strong>. We are committed to addressing your concerns and will ensure the removal of any specific image from our website <strong>within 24 hours or as soon as administratively feasible</strong>.
        </p>
      </section><br /> */}

      <h2><strong>Update</strong></h2>

      <p>Should we update, amend, or make any changes to this document, those changes will be prominently posted here.</p>

    </div>
  );
};

export default Disclaimer;
