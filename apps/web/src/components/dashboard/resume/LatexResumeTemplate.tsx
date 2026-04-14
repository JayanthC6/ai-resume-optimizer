import { forwardRef } from 'react';
import type { StructuredResume } from '@repo/types';

type Props = {
  data: StructuredResume;
};

export const LatexResumeTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { personalInfo, summary, experience, education, skills, projects } = data;

  return (
    <div className="bg-white text-black mx-auto overflow-hidden shadow-sm print:m-0 print:border-none print:shadow-none" style={{ maxWidth: '8.5in', minHeight: '11in' }}>
      <style type="text/css" media="all">
        {`
          @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
          
          .latex-font {
            font-family: 'Libre Baskerville', "Times New Roman", Times, serif;
            font-size: 10pt;
            line-height: 1.25;
            color: black;
          }
          
          .small-caps {
            font-variant: small-caps;
          }
          
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          .latex-section-rule {
            border-bottom: 1.2pt solid black;
            margin-bottom: 4pt;
          }

          .latex-item-list {
            margin-left: 0.2in;
            list-style-type: disc;
          }
          
          .latex-item-list li {
            padding-left: 0.1in;
            margin-bottom: 2pt;
          }
        `}
      </style>
      
      <div 
        ref={ref} 
        className="latex-font px-[0.65in] py-[0.65in] bg-white w-full h-full"
        style={{ width: '8.5in' }}
      >
        {/* HEADING */}
        <div className="text-center mb-5">
          <h1 className="text-[14pt] font-extrabold uppercase small-caps mb-1">
            {personalInfo.name}
          </h1>
          <div className="text-[9pt] flex justify-center gap-2 flex-wrap">
            <span>{personalInfo.phone}</span>
            <span>|</span>
            <span className="underline">{personalInfo.email}</span>
            {personalInfo.linkedin && (
              <>
                <span>|</span>
                <span className="underline">LinkedIn</span>
              </>
            )}
            {personalInfo.github && (
              <>
                <span>|</span>
                <span className="underline">GitHub</span>
              </>
            )}
            {personalInfo.portfolio && (
              <>
                <span>|</span>
                <span className="underline">Portfolio</span>
              </>
            )}
            {personalInfo.additionalLinks?.map((link, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span>|</span>
                <span className="underline">{link.label}</span>
              </span>
            ))}
            <span>|</span>
            <span>{personalInfo.location}</span>
          </div>
        </div>

        {/* SUMMARY */}
        {summary && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Professional Summary
            </h2>
            <p className="text-[9.5pt] leading-snug text-justify">
              {summary}
            </p>
          </div>
        )}

        {/* EXPERIENCE */}
        {experience && experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-bold">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-[9.5pt] mb-1">
                    <span>{exp.title}</span>
                    <span>{exp.startDate} -- {exp.endDate}</span>
                  </div>
                  <ul className="latex-item-list text-[9.5pt]">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {projects && projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold">
                      {proj.name} 
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className="font-normal italic"> | {proj.technologies.join(', ')}</span>
                      )}
                    </span>
                    {proj.link && <span className="text-[9pt] underline italic">Live Link</span>}
                  </div>
                  <ul className="latex-item-list text-[9.5pt]">
                    <li>{proj.description}</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {education && education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-bold">
                    <span>{edu.institution}</span>
                    <span>{edu.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-[9.5pt]">
                    <span>{edu.degree} {edu.gpa && <span className="font-normal not-italic ml-2">| GPA: {edu.gpa}</span>}</span>
                    <span>{edu.startDate ? edu.startDate + ' -- ' : ''} {edu.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS */}
        {skills && skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Skills
            </h2>
            <div className="space-y-1">
              {skills.map((s, idx) => (
                <div key={idx} className="text-[9.5pt]">
                  <span className="font-bold">{s.category}:</span> {s.items.join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

LatexResumeTemplate.displayName = 'LatexResumeTemplate';
