import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

const stats = [
  { title: "Traffic", value: "350,897", icon: "fa-chart-bar", color: "bg-danger", trend: "up", change: "3.48%", period: "Since last month" },
  { title: "New users", value: "2,356", icon: "fa-chart-pie", color: "bg-warning", trend: "down", change: "3.48%", period: "Since last week" },
  { title: "Sales", value: "924", icon: "fa-users", color: "bg-yellow", trend: "down", change: "1.10%", period: "Since yesterday" },
  { title: "Performance", value: "49.65%", icon: "fa-percent", color: "bg-info", trend: "up", change: "12%", period: "Since last month" },
];

const Header = () => {
  return (
    <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
      <Container fluid>
        <Row>
          {stats.map((stat, index) => (
            <Col key={index} lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                        {stat.title}
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">{stat.value}</span>
                    </div>
                    <Col className="col-auto">
                      <div className={`icon icon-shape ${stat.color} text-white rounded-circle shadow`}>
                        <i className={`fas ${stat.icon}`} />
                      </div>
                    </Col>
                  </Row>
                  <p className="mt-3 mb-0 text-muted text-sm">
                    <span className={`text-${stat.trend === "up" ? "success" : "danger"} mr-2`}>
                      <i className={`fa fa-arrow-${stat.trend}`} /> {stat.change}
                    </span>{" "}
                    <span className="text-nowrap">{stat.period}</span>
                  </p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Header;
