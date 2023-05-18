import React, { useEffect } from "react";
import "./FooterEdit.css";
const FooterEdit = (props) => {
  const [Data, setData] = React.useState(null);
  useEffect(() => {
    setData(props.Data);
  }, []);
  const handleInput = (e) => {
    const { name, value } = e.target;
    if (
      name === "Facebook" ||
      name === "Instagram" ||
      name === "Telegram" ||
      name === "Pinterest" ||
      name === "Twitter" ||
      name === "Youtube"
    ) {
      setData((prev) => {
        return { ...prev, Socials: { ...prev.Socials, [name]: value } };
      });
    } else {
      setData((prev) => {
        return { ...prev, [name]: value };
      });
    }
  };
  let socialElements = null;
  if (Data) {
    const socialArray = Object.entries(Data.Socials).map(([name, link]) => ({
      name,
      link,
    }));
    socialElements = socialArray.map((social) => (
      <div className="formItem" key={social.name}>
        <label htmlFor={social.name}>{social.name}:</label>
        <input
          type="text"
          id={social.name}
          name={social.name}
          onChange={handleInput}
          value={social.link}
        />
      </div>
    ));
  }

  return (
    <section className="FooterEdit">
      <p>
        in this section you can edit the info of the footer such as Email Phone
        Address and social links, if you want to hide something just leave the
        field blank,to see the changes please refresh the page after pressing
        save
      </p>
      {Data && (
        <>
          <div className="Data">
            <div className="formItem">
              <label htmlFor="Email">Email:</label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={Data.Email}
                onChange={handleInput}
              />
            </div>
            <div className="formItem">
              <label htmlFor="Phone">Phone:</label>
              <input
                type="text"
                id="Phone"
                name="Phone"
                value={Data.Phone}
                onChange={handleInput}
              />
            </div>
          </div>
          <div className="formItem Address">
            <label htmlFor="Address">Address:</label>
            <input
              type="text"
              id="Address"
              name="Address"
              value={Data.Address}
              onChange={handleInput}
            />
          </div>
          <div className="SocialLinks">{socialElements}</div>
        </>
      )}
      <button
        className="button"
        onClick={() => {
          props.Save("sec7", Data);
        }}
      >
        Save
      </button>
    </section>
  );
};

export default FooterEdit;
