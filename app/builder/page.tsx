"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileText,
  Upload,
  Loader2,
  Search,
  Calendar,
  Clock,
  Info,
  Pencil,
} from "lucide-react";
import Link from "next/link";

type ActiveTab = "configuration" | "playground";
type ExtractedTab = "fields" | "json";

interface EntityNode {
  id: string;
  name: string;
  type: string;
  prompt: string;
  children?: EntityNode[];
}

interface AttributeField {
  id: string;
  name: string;
  description: string;
  children?: AttributeField[];
}

const entityData: EntityNode[] = [
  {
    id: "Account",
    name: "Account",
    type: "Account",
    prompt: "The lab report contains information about the doctor and patient. The Account object will be used to represent both. If...",
  },
  {
    id: "HealthCondition",
    name: "Health Condition",
    type: "HealthCondition",
    prompt: "Represents a clinical condition, problem, symptoms, or any clinically relevant occurrence that is a matter of concern....",
    children: [
      {
        id: "HealthConditionCriteria",
        name: "Health Condition Critera",
        type: "HealthConditionCriteria",
        prompt: "The contextual type of the condition. This is an enum with the following values: Encounter Diagnosis, Problem List...",
        children: [
          {
            id: "HealthConditionNested",
            name: "Health Condition",
            type: "HealthCondition",
            prompt: "Represents a clinical condition, problem, symptoms, or any clinically relevant occurrence that is a matter of c...",
          },
        ],
      },
    ],
  },
  {
    id: "CareObservation",
    name: "Care Observation",
    type: "CareObservation",
    prompt: "Prompt details...",
    children: [
      {
        id: "DiagnosticSummary",
        name: "Diagnostic Summary",
        type: "DiagnosticSummary",
        prompt: "Prompt details...",
      },
    ],
  },
  {
    id: "Case",
    name: "Case",
    type: "Case",
    prompt: "Prompt details...",
  },
  {
    id: "HealthCondition2",
    name: "Health Condition",
    type: "HealthCondition",
    prompt: "Prompt details...",
  },
  {
    id: "CareObservation2",
    name: "Care Observation",
    type: "CareObservation",
    prompt: "Prompt details...",
  },
];

const attributeFields: AttributeField[] = [
  {
    id: "referral-request",
    name: "Referral Request",
    description: "Core object that initiates a referral. Includes source, reason, urgency, etc.",
    children: [
      { id: "referral-request-name", name: "Referral Request Name", description: "Name fo the Referral" },
      { id: "identifier", name: "Identifier", description: "Unique Identifier tagged with the referral" },
      { id: "created-date", name: "Created Date", description: "Date on which referral is created" },
    ],
  },
  { id: "patient", name: "Patient", description: "Links to the patient's demographic and medical record." },
  { id: "referring-provider", name: "Referring Provider", description: "The provider who is initiating the referral." },
  { id: "receiving-provider", name: "Receiving Provider/Specialist", description: "The provider or facility receiving the referral." },
  { id: "referral-status", name: "Referral Status", description: "Tracks the state of the referral: Pending, In Progress, Accepted, Declined, Completed..." },
  { id: "lorem-ipsum", name: "Lorem Ipsum Label", description: "Label" },
];

// Case Intake data model
interface CaseIntakeEntity {
  entity: string;
  description: string;
  /** Entity-level prompt (defaults to description when not set) */
  prompt?: string;
  fields: { name: string; prompt: string }[];
}

const caseIntakeData: CaseIntakeEntity[] = [
  {
    entity: "Account",
    description: "The lab report contains information about the doctor and patient. The Account object represents both.",
    prompt: "The lab report contains information about the doctor and patient. The Account object represents both.",
    fields: [
      { name: "BillingCity", prompt: "The billing city associated with the account." },
      { name: "BillingStreet", prompt: "The billing street address." },
      { name: "BillingCountry", prompt: "The billing country." },
      { name: "BillingPostalCode", prompt: "The billing postal code." },
      { name: "BillingState", prompt: "The billing state." },
      { name: "FirstName", prompt: "The first name of the person." },
      { name: "LastName", prompt: "The last name of the person." },
      { name: "Salutation", prompt: "The salutation (Mr, Mrs, Dr, etc)." },
      { name: "Website", prompt: "The website URL." },
      { name: "Fax", prompt: "The fax number." },
      { name: "Birthdate", prompt: "The date of birth (YYYY-MM-DD)." },
      { name: "Gender", prompt: "The gender identity." },
      { name: "Phone", prompt: "The primary phone number." },
    ],
  },
  {
    entity: "CareObservation",
    description: "Observations and measurements taken during care.",
    prompt: "Observations and measurements taken during care.",
    fields: [
      { name: "AccountReference", prompt: "Reference ID to the Account." },
      { name: "ValueInterpretation", prompt: "Interpretation of the value (High, Low, Normal)." },
      { name: "ObserverReference", prompt: "Reference to the person observing." },
      { name: "CaseReference", prompt: "Reference ID to the Case." },
      { name: "EffectiveDateTime", prompt: "The date/time the observation was effective." },
      { name: "BaselineValueText", prompt: "Text description of the baseline value." },
      { name: "BaselineUnit", prompt: "Unit of measure for the baseline." },
      { name: "Category", prompt: "The category of observation." },
      { name: "ObservedStatus", prompt: "Status of the observation." },
      { name: "Name", prompt: "Name of the observation." },
      { name: "NumericValue", prompt: "Numeric result value." },
      { name: "ObservedValueText", prompt: "Text result value." },
      { name: "UpperBaselineValue", prompt: "Upper limit of the baseline range." },
      { name: "LowerBaselineValue", prompt: "Lower limit of the baseline range." },
    ],
  },
  {
    entity: "Case",
    description: "The core case file.",
    prompt: "The core case file.",
    fields: [
      { name: "AccountReference", prompt: "Reference ID to the Account." },
      { name: "Origin", prompt: "Origin of the case (Phone, Web, etc)." },
    ],
  },
  {
    entity: "DiagnosticSummary",
    description: "Summary of diagnostic findings.",
    prompt: "Summary of diagnostic findings.",
    fields: [
      { name: "AccountReference", prompt: "Reference ID to the Account." },
      { name: "AuthenticatorReference", prompt: "Reference to the authenticator." },
      { name: "CaseReference", prompt: "Reference ID to the Case." },
      { name: "Category", prompt: "Category of the summary." },
      { name: "Status", prompt: "Status of the summary." },
      { name: "AttachmentLanguage", prompt: "Language of the attachment." },
      { name: "EffectiveEndDateTime", prompt: "End date/time of validity." },
      { name: "EffectiveStartDateTime", prompt: "Start date/time of validity." },
      { name: "IssuedDateTime", prompt: "Date/time issued." },
      { name: "ImageUrl1", prompt: "URL for Image 1." },
      { name: "ImageComments3", prompt: "Comments for Image 3." },
      { name: "ImageComments2", prompt: "Comments for Image 2." },
      { name: "ImageComments1", prompt: "Comments for Image 1." },
    ],
  },
  {
    entity: "DiagnosticSummaryDetail",
    description: "Detailed line items for the diagnostic summary.",
    prompt: "Detailed line items for the diagnostic summary.",
    fields: [
      { name: "SpecimenReference", prompt: "Reference to the Specimen." },
      { name: "CareObservationReference", prompt: "Reference to the CareObservation." },
      { name: "DiagnosticSummaryReference", prompt: "Reference to the parent DiagnosticSummary." },
      { name: "DetailType", prompt: "Type of detail." },
    ],
  },
  {
    entity: "HealthCondition",
    description: "Conditions or symptoms identified.",
    prompt: "Conditions or symptoms identified.",
    fields: [
      { name: "CaseReference", prompt: "Reference ID to the Case." },
      { name: "AccountReference", prompt: "Reference ID to the Account." },
      { name: "Type", prompt: "Type of condition." },
      { name: "AbatementStartDateTime", prompt: "Start date of abatement." },
      { name: "AbatementEndDateTime", prompt: "End date of abatement." },
      { name: "ProblemDefinition", prompt: "Definition of the problem." },
      { name: "DiagnosticStatus", prompt: "Diagnostic status." },
      { name: "ConditionStatus", prompt: "Condition status." },
      { name: "Severity", prompt: "Severity level." },
      { name: "RecordCreationDateTime", prompt: "Date record was created." },
      { name: "ProblemName", prompt: "Name of the problem." },
      { name: "ProblemDescription", prompt: "Description of the problem." },
      { name: "OnsetStartDateTime", prompt: "Start of onset." },
      { name: "OnsetEndDateTime", prompt: "End of onset." },
      { name: "ExtlProblemDefIdentifier", prompt: "External problem identifier." },
    ],
  },
  {
    entity: "Specimen",
    description: "Biological specimens collected.",
    prompt: "Biological specimens collected.",
    fields: [
      { name: "Name", prompt: "Name of the specimen." },
      { name: "CaseReference", prompt: "Reference ID to the Case." },
      { name: "AccountReference", prompt: "Reference ID to the Account." },
      { name: "Status", prompt: "Status of the specimen." },
      { name: "GroupingMethod", prompt: "Method of grouping." },
      { name: "ReceivedDate", prompt: "Date received." },
      { name: "FastingDuration", prompt: "Duration of fasting." },
      { name: "CollectionQuantity", prompt: "Quantity collected." },
      { name: "CollectionDuration", prompt: "Duration of collection." },
      { name: "CollectionEndDate", prompt: "End date of collection." },
      { name: "CollectionStartDate", prompt: "Start date of collection." },
    ],
  },
];

function caseIntakeToEntityNodes(): EntityNode[] {
  return caseIntakeData.map(({ entity, description }) => ({
    id: entity,
    name: entity,
    type: entity,
    prompt: description,
  }));
}

function caseIntakeToAttributeFields(): AttributeField[] {
  return caseIntakeData.map(({ entity, description, fields }) => ({
    id: entity,
    name: entity,
    description,
    children: fields.map((f) => ({ id: `${entity}-${f.name}`, name: f.name, description: f.prompt })),
  }));
}

// Recursive nested tree (up to 4 levels) for Playground
interface NestedEntityNode {
  id: string;
  name: string;
  prompt?: string;
  children?: NestedEntityNode[];
  level: number;
}

const fullCaseIntakeTree: NestedEntityNode[] = [
  {
    id: "case-root",
    name: "Case",
    level: 0,
    prompt: "The core case file related to the patient's report.",
    children: [
      { id: "case-origin", name: "Origin", level: 1, prompt: "The origin or source of the case (e.g., Web, Phone, Email)." },
      { id: "case-account-ref", name: "AccountReference", level: 1, prompt: "Reference to the Account associated with this Case." },
    ],
  },
  {
    id: "account-root",
    name: "Account",
    level: 0,
    prompt: "The lab report contains information about the doctor and patient. The Account object represents both.",
    children: [
      {
        id: "acc-address",
        name: "Address Details",
        level: 1,
        prompt: "Extract all billing address components.",
        children: [
          { id: "acc-city", name: "BillingCity", level: 2, prompt: "The city associated with the Account." },
          { id: "acc-street", name: "BillingStreet", level: 2, prompt: "The street address associated with the Account." },
          { id: "acc-country", name: "BillingCountry", level: 2, prompt: "The country associated with the Account." },
          { id: "acc-zip", name: "BillingPostalCode", level: 2, prompt: "The ZIP or postal code." },
          { id: "acc-state", name: "BillingState", level: 2, prompt: "The state associated with the Account." },
        ],
      },
      {
        id: "acc-demo",
        name: "Demographics",
        level: 1,
        prompt: "Personal demographic details.",
        children: [
          { id: "acc-fname", name: "FirstName", level: 2, prompt: "The first name of the individual." },
          { id: "acc-lname", name: "LastName", level: 2, prompt: "The last name of the individual." },
          { id: "acc-salutation", name: "Salutation", level: 2, prompt: "The salutation (e.g., Mr., Mrs., Dr.)." },
          { id: "acc-dob", name: "Birthdate", level: 2, prompt: "The date of birth of the individual." },
          { id: "acc-gender", name: "Gender", level: 2, prompt: "The gender of the individual." },
        ],
      },
      { id: "acc-phone", name: "Phone", level: 1, prompt: "The primary phone number for the account." },
      { id: "acc-website", name: "Website", level: 1, prompt: "The website URL associated with the account." },
      { id: "acc-fax", name: "Fax", level: 1, prompt: "The fax number associated with the account." },
    ],
  },
  {
    id: "care-obs-root",
    name: "CareObservation",
    level: 0,
    prompt: "Represents the observed values for care metrics in the lab report.",
    children: [
      { id: "co-val-interp", name: "ValueInterpretation", level: 1, prompt: "Interpretation of the observed value (e.g., High, Low, Normal)." },
      { id: "co-eff-date", name: "EffectiveDateTime", level: 1, prompt: "The date and time when the observation was relevant." },
      { id: "co-baseline-text", name: "BaselineValueText", level: 1, prompt: "Text description of the baseline value." },
      { id: "co-baseline-unit", name: "BaselineUnit", level: 1, prompt: "The unit of measure for the baseline value." },
      { id: "co-category", name: "Category", level: 1, prompt: "The category of the observation." },
      { id: "co-status", name: "ObservedStatus", level: 1, prompt: "The status of the observation (e.g., final, preliminary)." },
      { id: "co-name", name: "Name", level: 1, prompt: "The name of the observation." },
      { id: "co-num-val", name: "NumericValue", level: 1, prompt: "The numeric result of the observation." },
      { id: "co-text-val", name: "ObservedValueText", level: 1, prompt: "The text result of the observation." },
      { id: "co-upper", name: "UpperBaselineValue", level: 1, prompt: "The upper limit of the normal range." },
      { id: "co-lower", name: "LowerBaselineValue", level: 1, prompt: "The lower limit of the normal range." },
    ],
  },
  {
    id: "diag-sum-root",
    name: "DiagnosticSummary",
    level: 0,
    prompt: "Details of the patient for which the lab report is generated.",
    children: [
      { id: "ds-category", name: "Category", level: 1, prompt: "The category of the diagnostic summary." },
      { id: "ds-status", name: "Status", level: 1, prompt: "The status of the summary." },
      { id: "ds-issued", name: "IssuedDateTime", level: 1, prompt: "The date and time the summary was issued." },
      { id: "ds-start", name: "EffectiveStartDateTime", level: 1, prompt: "The start time of the effective period." },
      { id: "ds-end", name: "EffectiveEndDateTime", level: 1, prompt: "The end time of the effective period." },
      {
        id: "ds-images",
        name: "Image References",
        level: 1,
        prompt: "Attached images and comments.",
        children: [
          { id: "ds-img1", name: "ImageUrl1", level: 2, prompt: "URL or reference to the first image." },
          { id: "ds-comm1", name: "ImageComments1", level: 2, prompt: "Comments regarding the first image." },
        ],
      },
    ],
  },
  {
    id: "health-cond-root",
    name: "HealthCondition",
    level: 0,
    prompt: "Represents a clinical condition, problem, symptom, or finding.",
    children: [
      { id: "hc-prob-name", name: "ProblemName", level: 1, prompt: "The name of the problem or condition." },
      { id: "hc-prob-desc", name: "ProblemDescription", level: 1, prompt: "A detailed description of the problem." },
      { id: "hc-sev", name: "Severity", level: 1, prompt: "The severity of the condition (e.g., Mild, Severe)." },
      { id: "hc-status", name: "ConditionStatus", level: 1, prompt: "The clinical status of the condition." },
      { id: "hc-onset-start", name: "OnsetStartDateTime", level: 1, prompt: "When the condition first started." },
    ],
  },
  {
    id: "spec-root",
    name: "Specimen",
    level: 0,
    prompt: "Represents a sample used for analysis.",
    children: [
      { id: "sp-name", name: "Name", level: 1, prompt: "The name or label of the specimen." },
      { id: "sp-status", name: "Status", level: 1, prompt: "The status of the specimen." },
      { id: "sp-received", name: "ReceivedDate", level: 1, prompt: "The date the specimen was received." },
      { id: "sp-fasting", name: "FastingDuration", level: 1, prompt: "Duration of fasting before collection." },
    ],
  },
];

function flattenNestedNodes(nodes: NestedEntityNode[]): Record<string, string> {
  let result: Record<string, string> = {};
  nodes.forEach((node) => {
    if (node.prompt) result[node.id] = node.prompt;
    if (node.children) result = { ...result, ...flattenNestedNodes(node.children) };
  });
  return result;
}

// Recursive tree item for nested Case Intake (SLDS selection styling)
interface TreeItemProps {
  node: NestedEntityNode;
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
  expandedIds: string[];
  onToggle: (id: string) => void;
  prompts: Record<string, string>;
  onPromptChange: (id: string, value: string) => void;
}

function TreeItem({
  node,
  selectedNodeId,
  onSelect,
  expandedIds,
  onToggle,
  prompts,
  onPromptChange,
}: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const isSelected = selectedNodeId === node.id;
  const showPrompt = isExpanded || isSelected;

  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
    onToggle(node.id);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleRowClick}
        style={{ paddingLeft: `${node.level * 1.5}rem` }}
        className={`w-full flex items-center text-left py-2 px-1 rounded-sm transition-colors ${
          isSelected
            ? "bg-[#f0f8ff] text-[#0176d3] border-l-[3px] border-[#0176d3]"
            : "hover:bg-gray-50 text-slate-700"
        }`}
      >
        <span className="mr-2 flex-shrink-0 text-slate-400">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4 inline-block" />
          )}
        </span>
        <span className="text-sm font-medium">{node.name}</span>
      </button>
      {showPrompt && (
        <div
          style={{ paddingLeft: `${node.level * 1.5 + 1}rem` }}
          className="pb-3 pr-2"
        >
          <label className="block text-xs font-medium text-slate-500 mb-1">Instruction</label>
          <textarea
            className="w-full text-sm p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-white"
            rows={2}
            value={prompts[node.id] ?? node.prompt ?? ""}
            onChange={(e) => onPromptChange(node.id, e.target.value)}
          />
        </div>
      )}
      {hasChildren && isExpanded &&
        node.children!.map((child) => (
          <TreeItem
            key={child.id}
            node={child}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
            expandedIds={expandedIds}
            onToggle={onToggle}
            prompts={prompts}
            onPromptChange={onPromptChange}
          />
        ))}
    </div>
  );
}

export default function BuilderPage() {
  // State persists across tab switches
  const [activeTab, setActiveTab] = useState<ActiveTab>("configuration");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [extractedTab, setExtractedTab] = useState<ExtractedTab>("fields");
  const [expandedIds, setExpandedIds] = useState<string[]>(["Account", "HealthCondition", "CareObservation", "HealthConditionCriteria"]);
  const [selectedId, setSelectedId] = useState("Account");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [confidenceScore, setConfidenceScore] = useState(50);
  const [templateName, setTemplateName] = useState("PatientReferralDocument");
  const [llm, setLlm] = useState("GPT-4");
  const [description, setDescription] = useState("A document containing key clinical and demographic details used to refer a patient to another healthcare provider or specialist for further evaluation, treatment, or consultation.");
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initPromptsFromNodes = (nodes: EntityNode[]): Record<string, string> => {
    let result: Record<string, string> = {};
    nodes.forEach((node) => {
      result[node.id] = node.prompt;
      if (node.children) {
        result = { ...result, ...initPromptsFromNodes(node.children) };
      }
    });
    return result;
  };

  useEffect(() => {
    if (selectedContext === "Case Intake Form") {
      setPrompts(flattenNestedNodes(fullCaseIntakeTree));
      setExpandedIds(fullCaseIntakeTree.length > 0 ? [fullCaseIntakeTree[0].id] : []);
      setSelectedId(fullCaseIntakeTree.length > 0 ? fullCaseIntakeTree[0].id : "");
    } else if (selectedContext === "PatientReferralDocument") {
      setPrompts(initPromptsFromNodes(entityData));
      setExpandedIds(["Account", "HealthCondition", "CareObservation", "HealthConditionCriteria"]);
      setSelectedId("Account");
    } else {
      setPrompts({});
      setExpandedIds([]);
      setSelectedId("");
    }
  }, [selectedContext]);

  useEffect(() => {
    if (!isUploaded) {
      setShowResponse(false);
    }
  }, [isUploaded]);

  const currentEntityData =
    selectedContext === "Case Intake Form" ? caseIntakeToEntityNodes() : entityData;
  const currentAttributeFields =
    selectedContext === "Case Intake Form" ? caseIntakeToAttributeFields() : attributeFields;

  // Multi-select expansion: toggle only this node; other open nodes stay open.
  // - If id is in expandedIds → remove it (collapse). If not → add it (expand).
  // Example: Click Account → ['account-root']; Click Case → ['account-root', 'case-root']; Click Account again → ['case-root'].
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const updatePrompt = (id: string, value: string) => {
    setPrompts((prev) => ({ ...prev, [id]: value }));
  };

  // Simulate PDF extraction - generates different data based on file name
  const extractDataFromPDF = (fileName: string): any => {
    // Generate a hash-like value from filename to create consistent but different data
    const hash = fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = hash % 1000;
    
    // Generate different patient names based on file
    const names = [
      { first: "Baby", last: "Of Manisha Kantipudi" },
      { first: "Ananya", last: "Mehta" },
      { first: "Rajesh", last: "Kumar" },
      { first: "Priya", last: "Sharma" },
      { first: "Amit", last: "Patel" },
    ];
    const nameIndex = seed % names.length;
    const patient = names[nameIndex];
    
    // Generate different dates
    const dates = [
      { birthdate: "2024-11-14", effectiveDate: "2024-11-14T16:28:00" },
      { birthdate: "1985-03-15", effectiveDate: "2025-07-07T10:30:00" },
      { birthdate: "1990-06-20", effectiveDate: "2025-01-15T14:45:00" },
      { birthdate: "1978-12-05", effectiveDate: "2025-02-20T09:15:00" },
      { birthdate: "1995-09-10", effectiveDate: "2025-03-10T11:20:00" },
    ];
    const dateIndex = (seed * 2) % dates.length;
    const datesData = dates[dateIndex];
    
    // Generate different phone numbers
    const phones = [
      "+91-9876543210",
      "+91-9876543211",
      "+91-9876543212",
      "+91-9876543213",
      "+91-9876543214",
    ];
    const phone = phones[seed % phones.length];
    
    // Generate different addresses
    const addresses = [
      { street: "403, Prestige Harmony, Mahadevpura", city: "Bengaluru", state: "Karnataka", zip: "560048", country: "India" },
      { street: "123 Main Street", city: "Mumbai", state: "Maharashtra", zip: "400001", country: "India" },
      { street: "456 Park Avenue", city: "Delhi", state: "Delhi", zip: "110001", country: "India" },
      { street: "789 Tech Park", city: "Hyderabad", state: "Telangana", zip: "500032", country: "India" },
      { street: "321 Business District", city: "Pune", state: "Maharashtra", zip: "411001", country: "India" },
    ];
    const addrIndex = (seed * 3) % addresses.length;
    const address = addresses[addrIndex];
    
    // Generate different test values
    const testValues = [
      { numeric: 0.46, text: "0.46", interpretation: "Normal", upper: 15.0 },
      { numeric: 2.5, text: "2.5", interpretation: "Normal", upper: 10.0 },
      { numeric: 8.3, text: "8.3", interpretation: "Normal", upper: 12.0 },
      { numeric: 1.2, text: "1.2", interpretation: "Normal", upper: 5.0 },
      { numeric: 5.7, text: "5.7", interpretation: "Normal", upper: 8.0 },
    ];
    const testIndex = (seed * 4) % testValues.length;
    const test = testValues[testIndex];
    
    return {
      Account: {
        accountName: `${patient.first} ${patient.last}`,
        firstName: patient.first,
        lastName: patient.last,
        gender: seed % 2 === 0 ? "Male" : "Female",
        birthdate: datesData.birthdate,
        phone: phone,
        billingStreet: address.street,
        billingCity: address.city,
        billingState: address.state,
        billingPostalCode: address.zip,
        billingCountry: address.country,
        status: "Active"
      },
      HealthCondition: {
        problemName: seed % 2 === 0 ? "Congenital Adrenal Hyperplasia" : "Type 2 Diabetes",
        severity: null,
        conditionStatus: null,
        type: null,
        diagnosticStatus: null,
        onsetStart: null,
        onsetEnd: null,
        HealthConditionCriteria: {
          criteriaType: "Encounter Diagnosis",
          HealthCondition: {
            problemName: "Secondary Condition",
            severity: null
          }
        }
      },
      CareObservation: {
        name: `Test Result ${seed % 10 + 1}`,
        observer: "Account",
        observationStatus: "Final",
        category: "Vital-Signs",
        numericValue: test.numeric,
        observedValueText: test.text,
        interpretation: test.interpretation,
        lowerBaselineValue: null,
        upperBaselineValue: test.upper,
        baselineUnit: "µIU/mL",
        baselineValueText: `< ${test.upper}`,
        effectiveDateTime: datesData.effectiveDate,
        DiagnosticSummary: {
          name: "Medical Test Panel",
          status: "Final",
          conclusion: "All markers within normal range"
        }
      },
      Specimen: {
        name: "Blood Sample",
        status: "Available",
        receivedDate: datesData.effectiveDate,
        collectionStartDate: datesData.effectiveDate,
        collectionDuration: 15.0,
        collectionQuantity: null,
        fastingDuration: null
      },
      Case: {
        origin: seed % 3 === 0 ? "Web" : seed % 3 === 1 ? "Phone" : "Email",
        status: "New",
        subject: `Medical Consultation - ${patient.first} ${patient.last}`,
        contact: `${patient.first} ${patient.last}`
      }
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setIsProcessing(true);
      setShowResponse(false); // Reset response when new file is uploaded
      
      // Simulate extraction process
      setTimeout(() => {
        const extracted = extractDataFromPDF(file.name);
        setExtractedData(extracted);
        setIsProcessing(false);
        setIsUploaded(true);
      }, 1500);
    }
  };

  const handleClearUpload = () => {
    setIsUploaded(false);
    setShowResponse(false);
    setFileName("");
    setExtractedData(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const findNode = (nodes: EntityNode[], id: string): EntityNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedEntity = findNode(currentEntityData, selectedId);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Fixed Top Header */}
      <header className="flex-none h-12 bg-[#032D60] text-white flex items-center px-4 justify-between z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <ArrowLeft className="w-5 h-5 cursor-pointer hover:opacity-80" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/70">Template Name</span>
            <span className="font-medium">{templateName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedContext) {
                // Save logic - can be extended later
                console.log("Save clicked", { selectedContext, templateName, llm, description });
              }
            }}
            disabled={!selectedContext}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              selectedContext
                ? "bg-white text-[#0176D3] hover:bg-gray-50 cursor-pointer"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Save
          </button>
          <button className="flex items-center gap-1 text-sm text-white/90 hover:text-white">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-1 text-sm text-white/90 hover:text-white">
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="flex-none bg-white border-b border-gray-200 px-4 flex items-center z-40">
        <div className="flex">
          <button
            onClick={() => setActiveTab("configuration")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "configuration"
                ? "text-[#0176D3] border-[#0176D3]"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "playground"
                ? "text-[#0176D3] border-[#0176D3]"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Playground
          </button>
        </div>
      </div>

      {/* Main Content Area - Fixed height, no scroll */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "configuration" ? (
          <ConfigurationView
            key={selectedContext || "empty"}
            templateName={templateName}
            setTemplateName={setTemplateName}
            llm={llm}
            setLlm={setLlm}
            description={description}
            setDescription={setDescription}
            confidenceScore={confidenceScore}
            setConfidenceScore={setConfidenceScore}
            selectedContext={selectedContext}
            setSelectedContext={setSelectedContext}
            attributeFields={currentAttributeFields}
            defaultExpandedFieldIds={
              selectedContext === "Case Intake Form" && caseIntakeData.length > 0
                ? [caseIntakeData[0].entity]
                : ["referral-request"]
            }
          />
        ) : (
          <PlaygroundView
            isUploaded={isUploaded}
            isProcessing={isProcessing}
            showResponse={showResponse}
            setShowResponse={setShowResponse}
            extractedTab={extractedTab}
            setExtractedTab={setExtractedTab}
            expandedIds={expandedIds}
            selectedId={selectedId}
            prompts={prompts}
            pdfUrl={pdfUrl}
            fileName={fileName}
            fileInputRef={fileInputRef}
            entityData={currentEntityData}
            selectedEntity={selectedEntity}
            toggleExpanded={toggleExpanded}
            setSelectedId={setSelectedId}
            updatePrompt={updatePrompt}
            handleFileSelect={handleFileSelect}
            handleClearUpload={handleClearUpload}
            selectedContext={selectedContext}
            extractedData={extractedData}
            caseIntakeData={caseIntakeData}
            fullCaseIntakeTree={fullCaseIntakeTree}
          />
        )}
      </div>
    </div>
  );
}

// ========== CONFIGURATION VIEW ==========
interface ConfigurationViewProps {
  templateName: string;
  setTemplateName: (v: string) => void;
  llm: string;
  setLlm: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  confidenceScore: number;
  setConfidenceScore: (v: number) => void;
  selectedContext: string;
  setSelectedContext: (v: string) => void;
  attributeFields: AttributeField[];
  defaultExpandedFieldIds: string[];
}

function ConfigurationView({
  templateName,
  setTemplateName,
  llm,
  setLlm,
  description,
  setDescription,
  confidenceScore,
  setConfidenceScore,
  selectedContext,
  setSelectedContext,
  attributeFields: configAttributeFields,
  defaultExpandedFieldIds,
}: ConfigurationViewProps) {
  const [expandedFields, setExpandedFields] = useState<string[]>(defaultExpandedFieldIds);

  const toggleFieldExpanded = (id: string) => {
    setExpandedFields((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="flex-none w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        {/* Context Definition Name */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Context Definition Name</h4>
          <p className="text-xs text-gray-500 mb-3">Select the Context Definition to extract and map to fields on an object.</p>
          <select 
            value={selectedContext}
            onChange={(e) => setSelectedContext(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white mb-2"
          >
            <option value="">Select...</option>
            <option value="Case Intake Form">Case Intake Form</option>
            <option value="PatientReferralDocument">PatientReferralDocument</option>
          </select>
          <button className="w-full text-sm text-[#0176D3] border border-[#0176D3] rounded px-3 py-2 hover:bg-blue-50 mb-3">
            Edit Context Definition
          </button>
          <div className="flex items-start gap-2 text-xs text-gray-500 mb-3">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span>This is a Standard Context Definition. Any Edit will lead to cloning</span>
          </div>
          <button className="w-full text-sm text-[#0176D3] border border-[#0176D3] rounded px-3 py-2 hover:bg-blue-50">
            Create Context Definition
          </button>
        </div>

        {/* Context Mapping Name */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Context Mapping Name</h4>
          <p className="text-xs text-gray-500 mb-3">The mapping of attribute fields to object fields, and also stores the attribute description. This context mapping is used to feed data into the extraction mapping.</p>
          <select className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white">
            <option>PatientReferralMapping</option>
          </select>
        </div>
      </div>

      {/* Main Content - flat design, no extra padding */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-gray-100 p-4">
        <div className="w-full">
          {/* Empty State - illustration only when no context is selected */}
          {!selectedContext && (
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              {/* Blue Wireframe Desert Illustration */}
              <svg
                width="300"
                height="200"
                viewBox="0 0 300 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-6 opacity-75"
              >
                <path
                  d="M40 160 H260 M70 160 V120 M70 120 V100 M70 120 H50 V110 M70 100 H90 V110 M200 160 V130 M200 130 H180 V140 M200 130 V110 M200 110 H220 V120"
                  stroke="#89c6f5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="230" cy="50" r="15" stroke="#89c6f5" strokeWidth="2" />
                <path d="M120 160 L140 140 L160 160" stroke="#89c6f5" strokeWidth="2" />
                <path d="M10 160 H290" stroke="#89c6f5" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
              <p className="text-sm text-slate-500 text-center max-w-md">
                Select Context Definition and mapping to view the Fields
              </p>
            </div>
          )}

          {/* Extraction Template Details + Document Fields - only when context is selected */}
          {selectedContext && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Extraction Template Details</h2>
              <div className="bg-white p-5 mb-4">
                <div className="grid grid-cols-2 gap-6 mb-5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-gray-500">Template Name</label>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-900">{templateName}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-gray-500">LLM</label>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-900">{llm}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-gray-500">Description</label>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-900">{description}</p>
                </div>
              </div>
              <div className="bg-white overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50">
                <div className="px-4 py-3 text-sm font-medium text-gray-700 flex items-center gap-2">
                  Document (Attribute) Fields
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="px-4 py-3 text-sm font-medium text-gray-700 flex items-center gap-2">
                  Prompt Description
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Table Rows */}
              {configAttributeFields.map((field) => (
                <AttributeFieldRow
                  key={field.id}
                  field={field}
                  level={0}
                  expandedFields={expandedFields}
                  toggleExpanded={toggleFieldExpanded}
                />
              ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== ATTRIBUTE FIELD ROW ==========
interface AttributeFieldRowProps {
  field: AttributeField;
  level: number;
  expandedFields: string[];
  toggleExpanded: (id: string) => void;
}

function AttributeFieldRow({ field, level, expandedFields, toggleExpanded }: AttributeFieldRowProps) {
  const isExpanded = expandedFields.includes(field.id);
  const hasChildren = field.children && field.children.length > 0;
  const paddingLeft = level * 24 + 16;

  return (
    <>
      <div className="grid grid-cols-2 border-b border-gray-100 hover:bg-gray-50">
        <div
          className="px-4 py-3 flex items-center gap-2 cursor-pointer"
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => hasChildren && toggleExpanded(field.id)}
        >
          {hasChildren ? (
            <button className="p-0.5">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <span className={`text-sm ${level === 0 ? "text-[#0176D3] font-medium" : "text-[#0176D3]"}`}>
            {field.name}
          </span>
        </div>
        <div className="px-4 py-3 text-sm text-gray-600 truncate">
          {field.description}
        </div>
      </div>

      {hasChildren && isExpanded && field.children!.map((child) => (
        <AttributeFieldRow
          key={child.id}
          field={child}
          level={level + 1}
          expandedFields={expandedFields}
          toggleExpanded={toggleExpanded}
        />
      ))}
    </>
  );
}

// ========== PLAYGROUND VIEW (3-Pane Layout) ==========
interface PlaygroundViewProps {
  isUploaded: boolean;
  isProcessing: boolean;
  showResponse: boolean;
  setShowResponse: (v: boolean) => void;
  extractedTab: ExtractedTab;
  setExtractedTab: (tab: ExtractedTab) => void;
  expandedIds: string[];
  selectedId: string;
  prompts: Record<string, string>;
  pdfUrl: string | null;
  fileName: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  entityData: EntityNode[];
  selectedEntity: EntityNode | undefined;
  toggleExpanded: (id: string) => void;
  setSelectedId: (id: string) => void;
  updatePrompt: (id: string, value: string) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearUpload: () => void;
  selectedContext: string;
  extractedData: any;
  caseIntakeData: CaseIntakeEntity[];
  fullCaseIntakeTree: NestedEntityNode[];
}

function PlaygroundView({
  isUploaded,
  isProcessing,
  showResponse,
  setShowResponse,
  extractedTab,
  setExtractedTab,
  expandedIds,
  selectedId,
  prompts,
  pdfUrl,
  fileName,
  fileInputRef,
  entityData,
  selectedEntity,
  toggleExpanded,
  setSelectedId,
  updatePrompt,
  handleFileSelect,
  handleClearUpload,
  selectedContext,
  extractedData,
  caseIntakeData,
  fullCaseIntakeTree,
}: PlaygroundViewProps) {
  return (
    <div className="h-full grid grid-cols-3 overflow-hidden">
      {/* LEFT PANE - PDF Viewer */}
      <div className="flex flex-col h-full min-h-0 border-r border-gray-200 bg-white">
        {/* Fixed Header */}
        <div className="flex-none h-[60px] border-b border-gray-200 px-4 flex items-center justify-between bg-white z-10">
          <h3 className="text-base font-semibold text-gray-800">Extract Document Fields</h3>
          {isUploaded && (
            <button
              onClick={handleClearUpload}
              className="h-9 px-4 text-sm font-medium text-[#0176D3] border border-[#0176D3] rounded hover:bg-blue-50"
            >
              Clear & Upload New File
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <Loader2 className="w-12 h-12 text-[#0176D3] animate-spin mb-4" />
              <p className="text-base font-medium text-gray-900">Processing...</p>
              <p className="text-sm text-gray-500 mt-1">Extracting document content</p>
            </div>
          ) : !isUploaded ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="pdf-upload" />
              <div className="mb-6">
                <svg width="160" height="120" viewBox="0 0 200 140" fill="none">
                  <ellipse cx="100" cy="125" rx="75" ry="8" fill="#E8F4FD" />
                  <rect x="60" y="45" width="80" height="70" rx="6" fill="#0176D3" opacity="0.08" stroke="#0176D3" strokeWidth="2" strokeDasharray="6 3" />
                  <path d="M100 65 L100 95" stroke="#0176D3" strokeWidth="2.5" opacity="0.4" />
                  <path d="M88 77 L100 65 L112 77" stroke="#0176D3" strokeWidth="2.5" opacity="0.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Files</h4>
              <p className="text-sm text-gray-500 text-center mb-6 max-w-[260px]">
                Files larger than 2MB or 10 pages may have a longer preview prompt response time.
              </p>
              <label htmlFor="pdf-upload" className="h-9 px-4 flex items-center gap-2 bg-white border border-[#0176D3] text-[#0176D3] text-sm font-medium rounded hover:bg-blue-50 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Files
              </label>
              <span className="text-sm text-gray-400 mt-3">Or drop files</span>
            </div>
          ) : (
            <div className="h-full flex flex-col bg-gray-50">
              {/* File Info */}
              <div className="flex-none p-3 border-b border-gray-200 flex items-center gap-3 bg-white">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{fileName || "Patient_Referral_Request"}</p>
                  <p className="text-sm text-gray-500">Total Pages: 8</p>
                </div>
              </div>

              {/* Page Navigation */}
              <div className="flex-none flex items-center justify-center gap-4 py-3 border-b border-gray-200 bg-white">
                <button className="p-1.5 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                <span className="text-sm text-gray-700 font-medium">2 / 1</span>
                <button className="p-1.5 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
              </div>

              {/* PDF Iframe - Full height, flush */}
              <div className="flex-1 min-h-0">
                {pdfUrl ? (
                  <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
                ) : (
                  <div className="h-full overflow-y-auto p-3">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-sm">
                      <div className="text-center font-bold text-base border-b border-gray-200 pb-3 mb-4">
                        Patient Referral Request Form
                      </div>
                      <div className="text-gray-600 space-y-1 mb-4">
                        <p>Date: July 07, 2025</p>
                        <p>Referral Request ID: REF-2025-00073</p>
                      </div>
                      <div className="mb-4">
                        <div className="bg-gray-800 text-white px-3 py-1.5 text-sm font-medium">Patient Information</div>
                        <div className="pt-2 space-y-1 text-gray-700">
                          <p>Full Name: Ananya Mehta</p>
                          <p>Date of Birth: 15 March 1985</p>
                          <p>Gender: Female</p>
                          <p>Contact Number: +91-9876543210</p>
                          <p>Email Address: ananyamehta@gmail.com</p>
                          <p>Address: 403, Prestige Harmony, Mahadevpura, Bengaluru, Karnataka - 560048</p>
                          <p>Insurance Provider: HDFC Ergo Health</p>
                          <p>Insurance ID: HEG-2104859327</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="bg-gray-800 text-white px-3 py-1.5 text-sm font-medium">Referring Doctor</div>
                        <div className="pt-2 space-y-1 text-gray-700">
                          <p>Doctor Name: Dr. Ramesh Nair</p>
                          <p>Clinic Name: Family Care Clinic, Mahadevpura</p>
                          <p>Contact Number: +91-9845098765</p>
                          <p>Referral Recommendation: Yes - Recommended referral to a Cardiologist</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="bg-gray-800 text-white px-3 py-1.5 text-sm font-medium">Reason for Referral</div>
                        <div className="pt-2 text-gray-700 space-y-2">
                          <p>I have been experiencing chest tightness, shortness of breath during mild activity, and occasional dizziness for the last 3-4 weeks.</p>
                          <p>I visited my family doctor who advised me to consult a cardiologist for further evaluation and possible diagnostic tests (ECG, Echocardiogram, etc.).</p>
                        </div>
                      </div>
                      <div>
                        <div className="bg-gray-800 text-white px-3 py-1.5 text-sm font-medium">Specialty Requested</div>
                        <div className="pt-2 text-gray-700">
                          <p>[✓] Cardiology</p>
                          <p>[ ] Neurology</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE PANE - Entity Tree */}
      <div className="flex flex-col h-full min-h-0 border-r border-gray-200 bg-white">
        {/* Fixed Header */}
        <div className="flex-none h-[60px] border-b border-gray-200 px-4 flex items-center bg-white z-10">
          <h3 className="text-base font-semibold text-gray-800">Entities to Extract</h3>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {!selectedContext ? (
            <div className="h-full flex items-center justify-center p-8">
              <p className="text-sm text-gray-500 text-center">
                Select a Context Definition in the Configuration tab to generate prompts.
              </p>
            </div>
          ) : selectedContext === "Case Intake Form" ? (
            <div className="p-3">
              {fullCaseIntakeTree.map((node) => (
                <TreeItem
                  key={node.id}
                  node={node}
                  selectedNodeId={selectedId || null}
                  onSelect={setSelectedId}
                  expandedIds={expandedIds}
                  onToggle={toggleExpanded}
                  prompts={prompts}
                  onPromptChange={updatePrompt}
                />
              ))}
            </div>
          ) : (
            entityData.map((entity) => (
              <EntityTreeItem
                key={entity.id}
                item={entity}
                level={0}
                expandedIds={expandedIds}
                toggleExpand={toggleExpanded}
                selectedId={selectedId}
                onSelect={setSelectedId}
                prompts={prompts}
                onPromptChange={updatePrompt}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANE - Preview Extraction */}
      <div className="flex flex-col h-full min-h-0 bg-white">
        {/* Fixed Header */}
        <div className="flex-none h-[60px] border-b border-gray-200 px-4 flex items-center justify-between bg-white z-10">
          <h3 className="text-base font-semibold text-gray-800">Preview Extraction</h3>
          <div className="flex items-center gap-3">
            <select className="h-9 px-3 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500">
              <option>GPT-4</option>
              <option>GPT-3.5</option>
            </select>
            <button
              onClick={() => setShowResponse(true)}
              disabled={!isUploaded}
              className={`h-9 px-4 text-sm font-medium rounded border transition-colors ${
                isUploaded
                  ? "border-[#0176D3] text-[#0176D3] hover:bg-blue-50"
                  : "border-gray-300 text-gray-400 cursor-not-allowed"
              }`}
            >
              Show Response
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-none border-b border-gray-200 px-4">
          <div className="flex">
            <button
              onClick={() => setExtractedTab("fields")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                extractedTab === "fields" ? "text-[#0176D3] border-[#0176D3]" : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Extracted Fields
            </button>
            <button
              onClick={() => setExtractedTab("json")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                extractedTab === "json" ? "text-[#0176D3] border-[#0176D3]" : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {extractedTab === "json" ? (
            <JsonView showResponse={showResponse} entityType={selectedEntity?.type || "Account"} extractedData={extractedData} />
          ) : (
            <FormView showResponse={showResponse} entityType={selectedEntity?.type || "Account"} extractedData={extractedData} />
          )}
        </div>
      </div>
    </div>
  );
}

// ========== ENTITY TREE ITEM ==========
interface EntityTreeItemProps {
  item: EntityNode;
  level: number;
  expandedIds: string[];
  toggleExpand: (id: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  prompts: Record<string, string>;
  onPromptChange: (id: string, value: string) => void;
}

function EntityTreeItem({ item, level, expandedIds, toggleExpand, selectedId, onSelect, prompts, onPromptChange }: EntityTreeItemProps) {
  const isExpanded = expandedIds.includes(item.id);
  const isSelected = selectedId === item.id;
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = level * 16 + 12;

  return (
    <div>
      <div className={`border-b border-gray-100 ${isSelected ? "bg-blue-50" : "bg-white"}`}>
        {/* Dense header row - reduced vertical padding */}
        <div
          className={`flex items-center gap-1 py-1.5 cursor-pointer hover:bg-gray-50 ${isSelected ? "hover:bg-blue-50" : ""}`}
          style={{ paddingLeft: `${paddingLeft}px`, paddingRight: "12px" }}
          onClick={() => onSelect(item.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
              className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          )}
          <span className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
            {item.name}
          </span>
        </div>

        {/* Compact input - single-line height, tight spacing */}
        <div className="pb-1.5" style={{ paddingLeft: `${paddingLeft + 20}px`, paddingRight: "12px" }}>
          <input
            type="text"
            value={prompts[item.id] || ""}
            onChange={(e) => onPromptChange(item.id, e.target.value)}
            placeholder="Prompt details..."
            className="w-full h-9 text-sm text-gray-700 px-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {hasChildren && isExpanded && item.children!.map((child) => (
        <EntityTreeItem
          key={child.id}
          item={child}
          level={level + 1}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          selectedId={selectedId}
          onSelect={onSelect}
          prompts={prompts}
          onPromptChange={onPromptChange}
        />
      ))}
    </div>
  );
}

// ========== FORM COMPONENTS ==========
function FormField({ label, value, required }: { label: string; value: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1.5 block">
        {required && <span className="text-red-500">* </span>}{label}
      </label>
      <input
        type="text"
        defaultValue={value}
        placeholder="—"
        className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function FormDropdown({ label, value, options, required }: { label: string; value: string; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1.5 block">
        {required && <span className="text-red-500">* </span>}{label}
      </label>
      <select
        defaultValue={value}
        className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
      >
        <option value="">—</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function FormSearchField({ label, value, type }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1.5 block">{label}</label>
      <div className="flex gap-2">
        {type && (
          <select className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 bg-white w-28">
            <option>{type}</option>
          </select>
        )}
        <div className="relative flex-1">
          <input
            type="text"
            defaultValue={value}
            placeholder="Search..."
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

function FormDateTimeField({ label, dateValue, timeValue, hasInfo }: { label: string; dateValue: string; timeValue: string; hasInfo?: boolean }) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1.5 flex items-center gap-1.5">
        {label}
        {hasInfo && <Info className="w-4 h-4 text-blue-500" />}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <input type="text" defaultValue={dateValue} placeholder="Date" className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500" />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <div className="relative">
          <input type="text" defaultValue={timeValue} placeholder="Time" className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500" />
          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

// ========== EMPTY STATE MESSAGE ==========
function EmptyStateMessage() {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-sm text-gray-500 text-center px-8">
        The fields will appear here after uploading a PDF and clicking Show Response.
      </p>
    </div>
  );
}

// ========== FORM VIEW ==========
interface FormViewProps {
  showResponse: boolean;
  entityType: string;
  extractedData: any;
}

function FormView({ showResponse, entityType, extractedData }: FormViewProps) {
  // Show empty state if no response yet
  if (!showResponse) {
    return <EmptyStateMessage />;
  }

  // Helper to format date
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "";
    }
  };

  // Helper to format datetime
  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return { date: "", time: "" };
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { date: "", time: "" };
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
    } catch {
      return { date: "", time: "" };
    }
  };

  const data = extractedData || {};

  switch (entityType) {
    case "Account":
      const account = data.Account || {};
      return (
        <div className="space-y-5">
          <h4 className="text-xl font-semibold text-gray-900">Account</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Account Name" value={account.accountName || ""} required />
            <FormDropdown label="Status" value={account.status || "Active"} options={["Active", "Inactive"]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone" value={account.phone || ""} />
            <FormField label="Fax" value="" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Website" value="" />
            <FormField label="Billing Street" value={account.billingStreet || ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Billing City" value={account.billingCity || ""} />
            <FormField label="Billing State" value={account.billingState || ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Billing Zip" value={account.billingPostalCode || ""} />
            <FormField label="Billing Country" value={account.billingCountry || ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" value={account.firstName || ""} />
            <FormField label="Last Name" value={account.lastName || ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormDateTimeField label="Birthdate" dateValue={formatDate(account.birthdate)} timeValue="" />
            <FormDropdown label="Gender" value={account.gender || ""} options={["Male", "Female", "Other"]} />
          </div>
        </div>
      );

    case "CareObservation":
      const observation = data.CareObservation || {};
      const obsDateTime = formatDateTime(observation.effectiveDateTime);
      return (
        <div className="space-y-5">
          <h4 className="text-xl font-semibold text-gray-900">CareObservation</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" value={observation.name || ""} required />
            <FormSearchField label="Observer" value={observation.observer || ""} type="Account" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormDropdown label="Observation Status" value={observation.observationStatus || "Final"} options={["Final", "Preliminary", "Amended"]} required />
            <FormDropdown label="Category" value={observation.category || "Vital-Signs"} options={["Vital-Signs", "Laboratory", "Imaging"]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Numeric Value" value={observation.numericValue?.toString() || ""} />
            <FormField label="Observed Value Text" value={observation.observedValueText || ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormDropdown label="Value Interpretation" value={observation.interpretation || "Normal"} options={["Normal", "Abnormal", "Critical"]} />
            <FormField label="Lower Baseline Value" value={observation.lowerBaselineValue?.toString() || ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Upper Baseline Value" value={observation.upperBaselineValue?.toString() || ""} />
            <FormSearchField label="Baseline Unit" value={observation.baselineUnit || ""} />
          </div>
          <FormField label="Baseline Value Text" value={observation.baselineValueText || ""} />
          <FormDateTimeField label="Effective Date and Time" dateValue={obsDateTime.date} timeValue={obsDateTime.time} hasInfo />
        </div>
      );

    case "Specimen":
      const specimen = data.Specimen || {};
      const receivedDateTime = formatDateTime(specimen.receivedDate);
      const collectionDateTime = formatDateTime(specimen.collectionStartDate);
      return (
        <div className="space-y-5">
          <h4 className="text-xl font-semibold text-gray-900">Specimen</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" value={specimen.name || ""} required />
            <FormDropdown label="Status" value={specimen.status || "Available"} options={["Available", "Unavailable"]} />
          </div>
          <FormDateTimeField label="Received Date" dateValue={receivedDateTime.date} timeValue={receivedDateTime.time} />
          <FormDateTimeField label="Collection Start Date" dateValue={collectionDateTime.date} timeValue={collectionDateTime.time} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Collection Duration" value={specimen.collectionDuration?.toString() || ""} />
            <FormField label="Collection Quantity" value={specimen.collectionQuantity?.toString() || ""} />
          </div>
          <FormField label="Fasting Duration" value={specimen.fastingDuration?.toString() || ""} />
        </div>
      );

    case "HealthCondition":
    case "HealthConditionCriteria":
      const healthCondition = data.HealthCondition || {};
      return (
        <div className="space-y-5">
          <h4 className="text-xl font-semibold text-gray-900">HealthCondition</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormDropdown label="Severity" value={healthCondition.severity || ""} options={["Mild", "Moderate", "Severe"]} />
            <FormDropdown label="Condition Status" value={healthCondition.conditionStatus || ""} options={["Active", "Inactive", "Resolved"]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormDropdown label="Type" value={healthCondition.type || ""} options={["Problem", "Diagnosis", "Symptom"]} />
            <FormDropdown label="Diagnostic Status" value={healthCondition.diagnosticStatus || ""} options={["Confirmed", "Unconfirmed", "Provisional"]} />
          </div>
          <FormDateTimeField label="Onset Start" dateValue={formatDate(healthCondition.onsetStart)} timeValue="" />
          <FormDateTimeField label="Onset End" dateValue={formatDate(healthCondition.onsetEnd)} timeValue="" />
          <FormField label="Problem Name" value={healthCondition.problemName || ""} />
          <FormSearchField label="Problem Def" value="" />
        </div>
      );

    case "Case":
      const caseData = data.Case || {};
      return (
        <div className="space-y-5">
          <h4 className="text-xl font-semibold text-gray-900">Case</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormDropdown label="Origin" value={caseData.origin || "Web"} options={["Web", "Phone", "Email"]} />
            <FormDropdown label="Status" value={caseData.status || "New"} options={["New", "Working", "Closed"]} />
          </div>
          <FormField label="Subject" value={caseData.subject || ""} />
          <FormSearchField label="Contact" value={caseData.contact || ""} type="Account" />
        </div>
      );

    default:
      return (
        <div className="space-y-5">
          <h4 className="text-xl font-semibold text-gray-900">{entityType}</h4>
          <FormField label="Name" value={entityType} />
          <FormDropdown label="Status" value="Active" options={["Active", "Inactive"]} />
        </div>
      );
  }
}

// ========== JSON VIEW ==========
function JsonView({ showResponse, entityType, extractedData }: FormViewProps) {
  // Show empty state if no response yet
  if (!showResponse) {
    return <EmptyStateMessage />;
  }

  // Use extracted data if available, otherwise fallback to default
  const allExtractedData = extractedData || {
    Account: {
      accountName: "Baby Of Manisha Kantipudi",
      firstName: "Baby",
      lastName: "Of Manisha Kantipudi",
      gender: "Male",
      birthdate: "2024-11-14",
      phone: "+91-9876543210",
      billingStreet: "403, Prestige Harmony, Mahadevpura",
      billingCity: "Bengaluru",
      billingState: "Karnataka",
      billingPostalCode: "560048",
      billingCountry: "India",
      status: "Active"
    },
    HealthCondition: {
      problemName: "Congenital Adrenal Hyperplasia",
      severity: null,
      conditionStatus: null,
      type: null,
      diagnosticStatus: null,
      onsetStart: null,
      onsetEnd: null,
      HealthConditionCriteria: {
        criteriaType: "Encounter Diagnosis",
        HealthCondition: {
          problemName: "Secondary Condition",
          severity: null
        }
      }
    },
    CareObservation: {
      name: "Congenital Hypothyroidism (TSH)",
      observer: "Account",
      observationStatus: "Final",
      category: "Vital-Signs",
      numericValue: 0.46,
      observedValueText: "0.46",
      interpretation: "Normal",
      lowerBaselineValue: null,
      upperBaselineValue: 15.0,
      baselineUnit: "µIU/mL",
      baselineValueText: "< 15",
      effectiveDateTime: "2024-11-14T16:28:00",
      DiagnosticSummary: {
        name: "Newborn Screening Panel",
        status: "Final",
        conclusion: "All markers within normal range"
      }
    },
    Specimen: {
      name: "Blood Sample",
      status: "Available",
      receivedDate: "2024-11-14T16:43:00",
      collectionStartDate: "2024-11-14T16:28:00",
      collectionDuration: 15.0,
      collectionQuantity: null,
      fastingDuration: null
    },
    Case: {
      origin: "Web",
      status: "New",
      subject: "Newborn Screening - Baby Of Manisha Kantipudi",
      contact: "Baby Of Manisha Kantipudi"
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900">Extracted Data (JSON)</h4>
      <div className="bg-white border border-gray-300 rounded p-4 overflow-x-auto">
        <pre className="text-xs text-gray-900 font-mono whitespace-pre-wrap leading-relaxed">
          {JSON.stringify(allExtractedData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
