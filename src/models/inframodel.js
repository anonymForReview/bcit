export default

`
<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengroup.org/xsd/archimate/3.0/ http://www.opengroup.org/xsd/archimate/3.0/archimate3_Diagram.xsd http://purl.org/dc/elements/1.1/ http://dublincore.org/schemas/xmls/qdc/2008/02/11/dc.xsd" identifier="id-cfa06230-626c-4407-be14-afaa43403352">
  <name xml:lang="de">architecture demo</name>
  <metadata>
    <schema>Dublin Core</schema>
    <schemaversion>1.1</schemaversion>
    <dc:title>Architecture Demo</dc:title>
    <dc:creator>Tobias Seyffarth</dc:creator>
  </metadata>
  <elements>
    <element identifier="id-5038cbe0-ad7d-4aac-a3e5-d26f6ab6df35" xsi:type="ApplicationComponent">
      <name xml:lang="de">Enterprise Ressource Planing</name>
    </element>
    <element identifier="id-a89c7020-0dcd-4403-a632-f2babef1879c" xsi:type="ApplicationComponent">
      <name xml:lang="de">Financial Module</name>
    </element>
    <element identifier="id-9578ca75-02b9-4a87-93fb-449d3ffb65ca" xsi:type="ApplicationComponent">
      <name xml:lang="de">Material Management Module</name>
    </element>
    <element identifier="id-554e02f1-2946-4b05-9568-99b230516960" xsi:type="ApplicationComponent">
      <name xml:lang="de">Control Module</name>
    </element>
    <element identifier="id-9c0e1e6b-14a8-45a7-8986-6ce4821614a6" xsi:type="Device">
      <name xml:lang="de">Hardware</name>
      <properties>
        <property propertyDefinitionRef="propid-1">
          <value xml:lang="de">Halle, Germany</value>
        </property>
        <property propertyDefinitionRef="propid-2">
          <value xml:lang="de">HPE</value>
        </property>
      </properties>
    </element>
    <element identifier="id-554c5fbf-804f-449e-b5aa-2b55a261b943" xsi:type="SystemSoftware">
      <name xml:lang="de">Operating System</name>
      <properties>
        <property propertyDefinitionRef="propid-4">
          <value xml:lang="de">1803</value>
        </property>
        <property propertyDefinitionRef="propid-5">
          <value xml:lang="de">payed</value>
        </property>
        <property propertyDefinitionRef="propid-6">
          <value xml:lang="de">Linux</value>
        </property>
      </properties>
    </element>
    <element identifier="id-723ece90-e5e9-439a-8049-980de98616fc" xsi:type="SystemSoftware">
      <name xml:lang="de">DBMS</name>
    </element>
  </elements>
  <relationships>
    <relationship identifier="id-99ed9456-4c78-409e-ba04-1016dbdfcdaf" source="id-9c0e1e6b-14a8-45a7-8986-6ce4821614a6" target="id-723ece90-e5e9-439a-8049-980de98616fc" xsi:type="Serving" />
    <relationship identifier="id-673e8976-f7fd-4a6a-8ac8-e31c7100c306" source="id-9c0e1e6b-14a8-45a7-8986-6ce4821614a6" target="id-554c5fbf-804f-449e-b5aa-2b55a261b943" xsi:type="Serving" />
    <relationship identifier="id-f0667328-dd62-4384-809e-c1051247026e" source="id-554c5fbf-804f-449e-b5aa-2b55a261b943" target="id-5038cbe0-ad7d-4aac-a3e5-d26f6ab6df35" xsi:type="Serving" />
    <relationship identifier="id-d729aa61-7bb8-4a40-8c5d-766e360b24d9" source="id-5038cbe0-ad7d-4aac-a3e5-d26f6ab6df35" target="id-554e02f1-2946-4b05-9568-99b230516960" xsi:type="Serving" />
    <relationship identifier="id-ff54a0b2-279b-493b-84b7-302fa033c93b" source="id-5038cbe0-ad7d-4aac-a3e5-d26f6ab6df35" target="id-9578ca75-02b9-4a87-93fb-449d3ffb65ca" xsi:type="Serving" />
    <relationship identifier="id-5f471c06-2190-429e-a8ae-db8bb73a7af4" source="id-5038cbe0-ad7d-4aac-a3e5-d26f6ab6df35" target="id-a89c7020-0dcd-4403-a632-f2babef1879c" xsi:type="Serving" />
  </relationships>
  <propertyDefinitions>
    <propertyDefinition identifier="propid-3" type="string">
      <name />
    </propertyDefinition>
    <propertyDefinition identifier="propid-5" type="string">
      <name>license</name>
    </propertyDefinition>
    <propertyDefinition identifier="propid-2" type="string">
      <name>manufacture</name>
    </propertyDefinition>
    <propertyDefinition identifier="propid-6" type="string">
      <name>name</name>
    </propertyDefinition>
    <propertyDefinition identifier="propid-1" type="string">
      <name>place</name>
    </propertyDefinition>
    <propertyDefinition identifier="propid-4" type="string">
      <name>version</name>
    </propertyDefinition>
  </propertyDefinitions>
  <views>
    <diagrams>
      <view identifier="id-7c7175f2-6b69-4a30-9b55-9843a95ca81c" xsi:type="Diagram">
        <name xml:lang="de">Default View</name>
        <properties>
          <property propertyDefinitionRef="propid-4">
            <value xml:lang="de">10.2</value>
          </property>
          <property propertyDefinitionRef="propid-5">
            <value xml:lang="de">pay per use</value>
          </property>
        </properties>
        <node identifier="id-2cfaa124-f811-47fe-970d-7bd4014a4328" elementRef="id-9c0e1e6b-14a8-45a7-8986-6ce4821614a6" xsi:type="Element" x="864" y="648" w="120" h="55">
          <style>
            <fillColor r="201" g="231" b="183" />
            <lineColor r="92" g="92" b="92" />
          </style>
        </node>
        <node identifier="id-12f28aaa-974b-463c-ba62-d035e7c46e66" elementRef="id-554c5fbf-804f-449e-b5aa-2b55a261b943" xsi:type="Element" x="756" y="504" w="120" h="55">
          <style>
            <fillColor r="201" g="231" b="183" />
            <lineColor r="92" g="92" b="92" />
          </style>
        </node>
        <node identifier="id-31b11769-824d-46c1-8218-c71b4f816986" elementRef="id-5038cbe0-ad7d-4aac-a3e5-d26f6ab6df35" xsi:type="Element" x="671" y="396" w="120" h="55">
          <style>
            <fillColor r="181" g="255" b="255" />
            <lineColor r="92" g="92" b="92" />
          </style>
        </node>
        <node identifier="id-4980cdb7-348f-4621-981b-dbc79f5be544" elementRef="id-a89c7020-0dcd-4403-a632-f2babef1879c" xsi:type="Element" x="552" y="252" w="120" h="55">
          <style>
            <fillColor r="181" g="255" b="255" />
            <lineColor r="92" g="92" b="92" />
          </style>
        </node>
        <node identifier="id-a2a278a2-64ef-42e3-9dea-ae66d353c793" elementRef="id-9578ca75-02b9-4a87-93fb-449d3ffb65ca" xsi:type="Element" x="792" y="240" w="120" h="55">
          <style>
            <fillColor r="181" g="255" b="255" />
            <lineColor r="92" g="92" b="92" />
          </style>
        </node>
        <connection identifier="id-1b277da6-4e22-40d0-9b90-19f47d880846" relationshipRef="id-673e8976-f7fd-4a6a-8ac8-e31c7100c306" xsi:type="Relationship" source="id-2cfaa124-f811-47fe-970d-7bd4014a4328" target="id-12f28aaa-974b-463c-ba62-d035e7c46e66">
          <style>
            <lineColor r="0" g="0" b="0" />
          </style>
        </connection>
        <connection identifier="id-c0fb9799-8626-4cb7-9c55-0cf9112066d9" relationshipRef="id-f0667328-dd62-4384-809e-c1051247026e" xsi:type="Relationship" source="id-12f28aaa-974b-463c-ba62-d035e7c46e66" target="id-31b11769-824d-46c1-8218-c71b4f816986">
          <style>
            <lineColor r="0" g="0" b="0" />
          </style>
        </connection>
        <connection identifier="id-5a0708d6-f512-403e-b759-dfb5e071dbf3" relationshipRef="id-ff54a0b2-279b-493b-84b7-302fa033c93b" xsi:type="Relationship" source="id-31b11769-824d-46c1-8218-c71b4f816986" target="id-a2a278a2-64ef-42e3-9dea-ae66d353c793">
          <style>
            <lineColor r="0" g="0" b="0" />
          </style>
        </connection>
        <connection identifier="id-41f291be-d893-4827-aec4-dc4084fd3a67" relationshipRef="id-5f471c06-2190-429e-a8ae-db8bb73a7af4" xsi:type="Relationship" source="id-31b11769-824d-46c1-8218-c71b4f816986" target="id-4980cdb7-348f-4621-981b-dbc79f5be544">
          <style>
            <lineColor r="0" g="0" b="0" />
          </style>
        </connection>
      </view>
    </diagrams>
  </views>
</model>

`;
