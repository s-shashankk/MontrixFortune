import { Link } from "react-router-dom";
import LegalLayout from "../legal/LegalLayout";

const strengths = [
  ["Complete Furniture Solutions", "Office, educational, and residential furniture under one roof."],
  ["Advanced Manufacturing", "German-precision CNC machinery for accurate and consistent production."],
  ["Customized Designs", "Furniture designed around your specific needs and preferences."],
  ["Space Optimization", "Smart solutions for maximizing available space."],
  ["Quality and Affordability", "Durable, stylish furniture at competitive prices."],
  ["Experienced Team", "Skilled professionals dedicated to design, manufacturing, and customer satisfaction."],
];

const AboutUs = () => (
  <LegalLayout title="About Us" showUpdated={false} warm>
    <p>
      Montrix Fortune is a leading furniture manufacturing company specializing in comprehensive office,
      educational, and residential furniture solutions. We combine quality craftsmanship, innovative designs,
      and advanced manufacturing technology to create functional, stylish, and customized furniture that meets
      the unique needs of every customer.
    </p>
    <p>
      We specialize in furniture solutions for IT/BT companies, call centers, corporate offices, educational
      institutions, and residential spaces. Our extensive product range includes modular kitchens, modular
      office workstations, ergonomic chairs, conference tables, sofa seating, storage units, school furniture,
      bedroom wardrobes, TV units, and customized cabinets.
    </p>
    <p>
      Operating from a 20,000-square-foot manufacturing facility, we are equipped with world-class
      German-precision CNC machinery that enables us to deliver accuracy, consistency, and superior finishing.
      Supported by a team of highly qualified and experienced professionals, we transform ideas into practical,
      elegant, and durable furniture solutions.
    </p>
    <p>
      At Montrix Fortune, we believe every space has the potential to be exceptional. Whether your space is
      small or large, our expert design and development teams focus on maximizing space utilization, enhancing
      functionality, and creating interiors that reflect your vision and lifestyle.
    </p>
    <p>
      We continuously improve our manufacturing capabilities, explore innovative design concepts, and develop
      customized solutions to meet evolving customer expectations. Our commitment to quality, competitive
      pricing, timely execution, and customer satisfaction remains at the heart of everything we do.
    </p>
    <p>
      <strong>At Montrix Fortune, your ideas inspire our designs, and our expertise brings them to life.</strong>
    </p>
    <p>
      <Link to="/contact">Contact us today</Link> to discuss your requirements and discover furniture
      solutions tailored to your space, style, and budget.
    </p>

    <h2>Our Core Strengths</h2>
    <ul>
      {strengths.map(([title, text]) => (
        <li key={title}><strong>{title}:</strong> {text}</li>
      ))}
    </ul>
  </LegalLayout>
);

export default AboutUs;
