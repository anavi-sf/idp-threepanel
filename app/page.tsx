"use client";

import { useState } from "react";
import { Settings, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Modal form state
  const [templateName, setTemplateName] = useState("PatientReferralDocument");
  const [llm, setLlm] = useState("GPT-4");
  const [description, setDescription] = useState("A document containing key clinical and demographic details used to refer a patient to another healthcare provider or specialist for further evaluation, treatment, or consultation.");
  const [confidenceScore, setConfidenceScore] = useState(50);

  const templates = [
    {
      name: "PatientCaseIntake",
      contextDefinition: "PatientCaseIntakeInformation",
      contextMapping: "Patient Case Information Mapping",
    },
    {
      name: "DiseaseDefinition",
      contextDefinition: "DiseaseDefinitionDetails__stdctx",
      contextMapping: "DiseaseDefinitionMapping",
    },
  ];

  const handleCreateTemplate = () => {
    setShowModal(false);
    router.push("/builder");
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-md mb-4">
        <div className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0176D3] rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-[#0176D3] font-medium uppercase tracking-wide">
              SETUP
            </p>
            <h1 className="text-xl font-semibold text-gray-900">
              Intelligent Document Processing
            </h1>
          </div>
        </div>
      </div>

      {/* IDP Toggle Section */}
      <div className="bg-white border border-gray-200 rounded-md mb-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Intelligent Document Processing
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Process PDFs using Einstein Generative AI and large language
              models (LLMs) to extract the content and map it with the Health
              Cloud objects and fields.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isEnabled ? "bg-[#0176D3]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isEnabled ? "right-1" : "left-1"
                }`}
              />
            </button>
            <span className="text-xs text-gray-600">
              {isEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* Digitalize Document Content Section */}
      <div className="bg-white border border-gray-200 rounded-md p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Digitalize Document Content
        </h2>
        <p className="text-sm text-gray-600 mb-5">
          Create extraction templates to define the fields from which values are
          extracted from a file. In the prompt description, provide instructions
          for generative AI to identify the values of each specified field.
          Based on your requirements, you can choose the appropriate template to
          extract the relevant field values for each specified field.
        </p>

        {/* Extraction Templates Card */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Extraction Templates
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                2 items · Sorted by Extraction Template Name
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#0176D3] text-white text-sm font-medium px-4 py-2 rounded hover:bg-[#015ba1] transition-colors"
            >
              Create Extraction Template
            </button>
          </div>

          {/* Table - flush with card edges */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-600 px-4 py-2.5">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Extraction Template name
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-4 py-2.5">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Context Definition Name
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-4 py-2.5">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Context Mapping Name
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href="/builder"
                      className="text-sm text-[#0176D3] hover:underline cursor-pointer"
                    >
                      {template.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-700">
                    {template.contextDefinition}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-700">
                    {template.contextMapping}
                  </td>
                  <td className="px-4 py-2.5">
                    <button className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100">
                      <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                New Extraction Template
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {/* Details Section */}
              <h3 className="text-base font-semibold text-gray-900 mb-4">Details</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Template Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">
                    <span className="text-red-500">* </span>Template Name
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3]"
                  />
                </div>

                {/* Select LLM */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">
                    <span className="text-red-500">* </span>Select LLM
                  </label>
                  <select
                    value={llm}
                    onChange={(e) => setLlm(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3]"
                  >
                    <option value="GPT-4">GPT-4</option>
                    <option value="GPT-3.5">GPT-3.5</option>
                    <option value="Claude 3">Claude 3</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] resize-none"
                />
              </div>

              {/* Confidence Score Section */}
              <h3 className="text-base font-semibold text-gray-900 mb-2">Confidence Score</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set a confidence score range (minimum being 0) below which, extractions require manual review and define a low-confidence range to alert business users for validation.
              </p>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700">Low Confidence Range</span>
                  <span className="text-sm font-medium text-gray-900">0-{confidenceScore}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    {/* Track background */}
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      {/* Filled track */}
                      <div
                        className="h-1.5 bg-[#0176D3] rounded-full"
                        style={{ width: `${confidenceScore}%` }}
                      />
                    </div>
                    {/* Slider input */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={confidenceScore}
                      onChange={(e) => setConfidenceScore(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {/* Thumb indicator */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0176D3] rounded-full border-2 border-white shadow-md pointer-events-none"
                      style={{ left: `calc(${confidenceScore}% - 8px)` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">100</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0176D3] rounded-lg hover:bg-[#015ba1] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
