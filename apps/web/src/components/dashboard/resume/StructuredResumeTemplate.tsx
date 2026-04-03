import React, { forwardRef } from 'react';
import type { StructuredResume } from '@repo/types';

type Props = {
  data: StructuredResume;
};

export const StructuredResumeTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { personalInfo, summary, experience, education, skills, projects } = data;

  return (
    <div className="bg-white text-slate-900 mx-auto overflow-hidden rounded-xl border border-slate-200 shadow-sm print:m-0 print:border-none print:shadow-none" style={{ maxWidth: '8.5in', minHeight: '11in' }}>
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
        `}
      </style>
      <div ref={ref} className="p-[0.5in] print:p-[0.5in] w-full h-full text-slate-800 bg-white" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', width: '8.5in' }}>
        
        {/* Header - Personal Info */}
        <header className="mb-6 text-center border-b-[2px] border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase mb-2">
            {personalInfo?.name || 'NAME NOT PROVIDED'}
          </h1>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11pt] text-slate-700">
            {personalInfo?.email && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">E:</span> {personalInfo.email}
              </span>
            )}
            {personalInfo?.phone && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">P:</span> {personalInfo.phone}
              </span>
            )}
            {personalInfo?.location && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">L:</span> {personalInfo.location}
              </span>
            )}
            {personalInfo?.linkedin && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">in:</span> {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
              </span>
            )}
            {personalInfo?.github && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">git:</span> {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
              </span>
            )}
            {personalInfo?.portfolio && (
              <span className="flex items-center gap-1">
                <span className="font-semibold text-slate-600">W:</span> {personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
            )}
          </div>
        </header>

        {/* Professional Summary */}
        {summary && (
          <section className="mb-4 avoid-break">
            <h2 className="text-[11.5pt] font-extrabold text-slate-900 uppercase tracking-widest border-b-[1.5px] border-slate-400 mb-2 pb-1">
              Professional Summary
            </h2>
            <p className="text-[10pt] leading-[1.4] text-slate-800">
              {summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11.5pt] font-extrabold text-slate-900 uppercase tracking-widest border-b-[1.5px] border-slate-400 mb-2 pb-1">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div key={idx} className="avoid-break mt-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[11pt] font-bold text-slate-900">{exp.title}</h3>
                    <span className="text-[10pt] font-bold text-slate-600">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[10pt] italic font-semibold text-slate-800">{exp.company}</span>
                    <span className="text-[10pt] text-slate-500">{exp.location}</span>
                  </div>
                  <ul className="list-disc list-outside ml-5 space-y-0.5">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className="text-[10pt] leading-[1.3] text-slate-800 pl-1">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11.5pt] font-extrabold text-slate-900 uppercase tracking-widest border-b-[1.5px] border-slate-400 mb-2 pb-1">
              Key Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx} className="avoid-break mt-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[11pt] font-bold text-slate-900">
                      {proj.name} 
                      {proj.link && <span className="text-[9pt] font-normal text-slate-500 ml-2">| {proj.link}</span>}
                    </h3>
                  </div>
                  <p className="text-[10pt] leading-[1.3] text-slate-800 my-1">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[9pt] font-semibold text-slate-600 italic">Tools: <span className="font-normal">{proj.technologies.join(', ')}</span></p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section className="mb-4 avoid-break">
            <h2 className="text-[11.5pt] font-extrabold text-slate-900 uppercase tracking-widest border-b-[1.5px] border-slate-400 mb-2 pb-1">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start mt-1">
                  <div>
                    <h3 className="text-[10.5pt] font-bold text-slate-900">{edu.institution}</h3>
                    <p className="text-[10pt] font-medium text-slate-800">{edu.degree} {edu.gpa && <span className="font-semibold ml-1">| GPA: {edu.gpa}</span>}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10pt] font-bold text-slate-600 whitespace-nowrap">{edu.startDate && edu.startDate + ' – '}{edu.endDate}</p>
                    <p className="text-[9.5pt] text-slate-500">{edu.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="mb-4 avoid-break">
            <h2 className="text-[11.5pt] font-extrabold text-slate-900 uppercase tracking-widest border-b-[1.5px] border-slate-400 mb-2 pb-1">
              Core Competencies
            </h2>
            <div className="space-y-1.5 mt-1">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex text-[10pt]">
                  <span className="font-bold text-slate-900 w-1/4 shrink-0 pr-4">{skill.category}:</span>
                  <span className="text-slate-800">{skill.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
});
StructuredResumeTemplate.displayName = 'StructuredResumeTemplate';
