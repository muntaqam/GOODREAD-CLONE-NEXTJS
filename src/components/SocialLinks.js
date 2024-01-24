import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedinIn, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faLaptopCode } from "@fortawesome/free-solid-svg-icons";
function SocialLinks() {
  return (
    <div className="float-sm">
      {/* LinkedIn */}
      <div className="fl-fl float-fb">
        <FontAwesomeIcon icon={faLinkedinIn} />
        <a
          href="https://www.linkedin.com/in/muntaqam/"
          target="_blank"
          rel="noreferrer"
        >
          Lets Connect!
        </a>
      </div>

      {/* Twitter - Using faLaptopCode as an example */}
      <div className="fl-fl float-tw">
        <FontAwesomeIcon icon={faLaptopCode} />
        <a href="https://muntaqamaahi.com/" target="_blank" rel="noreferrer">
          My portfolio!
        </a>
      </div>

      {/* GitHub */}
      <div className="fl-fl float-gp">
        <FontAwesomeIcon icon={faGithub} />
        <a
          href="https://github.com/muntaqam/GOODREAD-CLONE-NEXTJS"
          target="_blank"
          rel="noreferrer"
        >
          See my code!
        </a>
      </div>
    </div>
  );
}

export default SocialLinks;
