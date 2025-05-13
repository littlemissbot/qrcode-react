import React from "react";
import {
  Form,
  Row,
  Col,
  Slider,
  ColorPicker,
  Select,
  InputNumber,
  Tooltip,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const QRCodeCustomization = () => {
  return (
    <>
      <Form.Item
        label={
          <Tooltip title="Choose the image format for your QR code. PNG is recommended for best quality, JPEG for smaller file size, and WebP for modern web browsers.">
            Image Type <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        }
        name="optionImageType"
      >
        <Select size="large">
          <Option value="image/png">PNG</Option>
          <Option value="image/jpeg">JPEG</Option>
          <Option value="image/webp">WebP</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={
          <Tooltip title="The white space around the QR code. Higher values create more padding, making the code easier to scan but larger in size.">
            Margin <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        }
        name="optionMargin"
      >
        <Slider min={1} max={20} step={1} />
      </Form.Item>

      <Form.Item
        label={
          <Tooltip title="Image quality setting. Higher values create better quality images but larger file sizes. Lower values create smaller files but may reduce quality.">
            Quality <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        }
        name="optionQuality"
      >
        <Slider min={0} max={1} step={0.1} />
      </Form.Item>

      <Row>
        <Col flex={2}>
          <Form.Item
            label={
              <Tooltip title="The color of the QR code pattern. Choose a color that contrasts well with the background for better scanning.">
                QR Code Color{" "}
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            }
            name="optionDarkColor"
            style={{ paddingRight: "15px" }}
          >
            <ColorPicker showText />
          </Form.Item>
        </Col>
        <Col flex={2}>
          <Form.Item
            label={
              <Tooltip title="The background color of the QR code. Should contrast well with the QR code color for optimal scanning.">
                Background Color{" "}
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            }
            name="optionLightColor"
            style={{ paddingLeft: "15px" }}
          >
            <ColorPicker showText />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col flex={2}>
          <Form.Item
            label={
              <Tooltip title="The pattern used to mask the QR code data. Different patterns can help with scanning reliability in different conditions.">
                Mask Pattern{" "}
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            }
            name="optionMaskPattern"
            style={{ paddingRight: "15px" }}
          >
            <InputNumber
              min={0}
              max={7}
              placeholder="Mask Pattern"
              size="large"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col flex={2}>
          <Form.Item
            label={
              <Tooltip title="The width of the QR code in pixels. Larger sizes create more detailed codes but larger file sizes.">
                Width (px) <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            }
            name="optionWidth"
            style={{ paddingLeft: "15px" }}
          >
            <InputNumber
              min={200}
              max={1200}
              placeholder="Width"
              size="large"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={
          <Tooltip title="The level of error correction in the QR code. Higher levels make the code more resistant to damage or poor scanning conditions, but increase the code size.">
            Error Correction Level{" "}
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        }
        name="errorCorrectionLevel"
      >
        <Select size="large">
          <Option value="L">Low (7%)</Option>
          <Option value="M">Medium (15%)</Option>
          <Option value="Q">Quartile (25%)</Option>
          <Option value="H">High (30%)</Option>
        </Select>
      </Form.Item>
    </>
  );
};

export default QRCodeCustomization;
