import React from "react";
import { Typography, Card, Row, Col } from "antd";
import "./styles.css";

const { Title, Paragraph } = Typography;

/**
 * The "how to" and FAQ copy that sits under the generator on each type page.
 * This is the crawlable text that gives every route something to rank for.
 */
const SeoContent = ({ type }) => {
  const { seo, label } = type;
  return (
    <section className="seo-content" aria-label={`About ${label} QR codes`}>
      <Row gutter={[32, 32]}>
        <Col xs={24} md={12}>
          <Card className="seo-content-card">
            <Title level={2} className="seo-content-heading">
              How to create a {label} QR code
            </Title>
            <ol className="seo-content-steps">
              {seo.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="seo-content-card">
            <Title level={2} className="seo-content-heading">
              Frequently asked questions
            </Title>
            {seo.faq.map(({ q, a }) => (
              <div className="seo-content-faq" key={q}>
                <Title level={3} className="seo-content-question">
                  {q}
                </Title>
                <Paragraph>{a}</Paragraph>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default SeoContent;
