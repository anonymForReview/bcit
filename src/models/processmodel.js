export default

` <?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="1.11.2">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>SequenceFlow_0kvx4lc</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1sgpsk2" name="Bestellung auslösen">
      <bpmn:incoming>SequenceFlow_0kvx4lc</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_0azjuw6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="SequenceFlow_0kvx4lc" sourceRef="StartEvent_1" targetRef="Task_1sgpsk2" />
    <bpmn:sequenceFlow id="SequenceFlow_0azjuw6" sourceRef="Task_1sgpsk2" targetRef="IntermediateThrowEvent_0zx3gi4" />
    <bpmn:sequenceFlow id="SequenceFlow_13bm6v6" sourceRef="IntermediateThrowEvent_0zx3gi4" targetRef="Task_0x618v5" />
    <bpmn:task id="Task_06hhsex" name="Auszahlungsanordnung erstellen">
      <bpmn:incoming>SequenceFlow_1t9nphz</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_0x2dp4m</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="SequenceFlow_1t9nphz" sourceRef="Task_0x618v5" targetRef="Task_06hhsex" />
    <bpmn:task id="Task_04c5c2t" name="Auszahlung auslösen">
      <bpmn:incoming>SequenceFlow_0x2dp4m</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_0lsno79</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="SequenceFlow_0x2dp4m" sourceRef="Task_06hhsex" targetRef="Task_04c5c2t" />
    <bpmn:endEvent id="EndEvent_002ixvi">
      <bpmn:incoming>SequenceFlow_0lsno79</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_0lsno79" sourceRef="Task_04c5c2t" targetRef="EndEvent_002ixvi" />
    <bpmn:subProcess id="Task_0x618v5" name="Rechnung kontrollieren">
      <bpmn:incoming>SequenceFlow_13bm6v6</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_1t9nphz</bpmn:outgoing>
    </bpmn:subProcess>
    <bpmn:intermediateCatchEvent id="IntermediateThrowEvent_0zx3gi4" name="Lieferung trifft ein">
      <bpmn:incoming>SequenceFlow_0azjuw6</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_13bm6v6</bpmn:outgoing>
      <bpmn:messageEventDefinition />
    </bpmn:intermediateCatchEvent>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1sgpsk2_di" bpmnElement="Task_1sgpsk2">
        <dc:Bounds x="285" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0kvx4lc_di" bpmnElement="SequenceFlow_0kvx4lc">
        <di:waypoint xsi:type="dc:Point" x="209" y="120" />
        <di:waypoint xsi:type="dc:Point" x="285" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="247" y="99" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_0azjuw6_di" bpmnElement="SequenceFlow_0azjuw6">
        <di:waypoint xsi:type="dc:Point" x="385" y="120" />
        <di:waypoint xsi:type="dc:Point" x="441" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="413" y="99" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_13bm6v6_di" bpmnElement="SequenceFlow_13bm6v6">
        <di:waypoint xsi:type="dc:Point" x="477" y="120" />
        <di:waypoint xsi:type="dc:Point" x="536" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="506.5" y="99" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Task_06hhsex_di" bpmnElement="Task_06hhsex">
        <dc:Bounds x="708" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_1t9nphz_di" bpmnElement="SequenceFlow_1t9nphz">
        <di:waypoint xsi:type="dc:Point" x="636" y="120" />
        <di:waypoint xsi:type="dc:Point" x="708" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="672" y="99" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Task_04c5c2t_di" bpmnElement="Task_04c5c2t">
        <dc:Bounds x="858.9001161440186" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0x2dp4m_di" bpmnElement="SequenceFlow_0x2dp4m">
        <di:waypoint xsi:type="dc:Point" x="808" y="120" />
        <di:waypoint xsi:type="dc:Point" x="859" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="833.5" y="99" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="EndEvent_002ixvi_di" bpmnElement="EndEvent_002ixvi">
        <dc:Bounds x="1029.9001161440185" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1047.9001161440185" y="142" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0lsno79_di" bpmnElement="SequenceFlow_0lsno79">
        <di:waypoint xsi:type="dc:Point" x="959" y="120" />
        <di:waypoint xsi:type="dc:Point" x="1030" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="994.5" y="99" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="SubProcess_0lloxgg_di" bpmnElement="Task_0x618v5">
        <dc:Bounds x="536" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="IntermediateCatchEvent_1w9vy5m_di" bpmnElement="IntermediateThrowEvent_0zx3gi4">
        <dc:Bounds x="441" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="417" y="142" width="85" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
