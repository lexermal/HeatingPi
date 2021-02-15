import { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { Button, Col, Container, Row } from "reactstrap";
import { TEMPERATURE_LOG } from "../../utils/backendCalls";

interface Temperature {
    id: string;
    date: number;
    value: number;
    simulated: boolean;
}

export default function TemperatureView() {
    const [fetchData, { data }] = useLazyQuery(TEMPERATURE_LOG);

    useEffect(() => fetchData(), []);

    return <Container className={"mt-5"}>
        <Row>
            <Col>
                <h1 className={"mb-5"}>Temperature log</h1>
            </Col>
        </Row>
        <Row>
            <Col>
                <Button onClick={() => {
                    const result = (data?.temperatureLog) as Temperature[];

                    if (result) {
                        const rows = result.map(value => `${value.id};${value.simulated};${value.date};${value.value}`);
                        downloadTxtFile(rows.join('\n'),"temperature-logs.csv")
                    }
                }}>Download</Button>
                <p className={"mt-2"}>This dataset contains <b>{data?.temperatureLog.length}</b> temperature entries of the last month.</p>
            </Col>
        </Row>
    </Container>
}

function downloadTxtFile(fileContend: any, fileName: string) {
    const file = new Blob([fileContend], { type: 'text/plain;charset=utf-8' });

    const element = document.createElement("a");

    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);

    element.click();
}
