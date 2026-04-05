import { forwardRef } from 'react';
import type { StructuredResume } from '@repo/types';

type Props = {
  data: StructuredResume;
};

export const StructuredResumeTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { personalInfo, summary, experience, education, skills, projects } = data;

  return (
    <div className="bg-white text-slate-900 mx-auto overflow-hidden rounded-xl border border-slate-200 shadow-sm print:m-0 print:border-none print:shadow-none" style={{ maxWidth: '8.5in' }}>
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
          a { text-decoration: none; color: #0366d6; }
        `}
      </style>
      <div ref={ref} className="px-[0.45in] py-[0.3in] print:px-[0.45in] print:py-[0.3in] w-full h-full text-slate-900 bg-white" style={{ fontFamily: '"Times New Roman", Times, serif', width: '8.5in' }}>
        {/* ── HEADER ── */}
        <header className="mb-2 text-center border-b-[1.5px] border-slate-800 pb-1.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize mb-0.5">
            {personalInfo?.name || 'NAME NOT PROVIDED'}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[9.5pt] text-slate-800">
            {personalInfo?.phone && (
              <span>{personalInfo.phone}</span>
            )}
            {personalInfo?.email && (
              <>
                <span className="text-slate-400">|</span>
                <a href={`mailto:${personalInfo.email}`} className="text-[#0366d6] hover:underline">
                  {personalInfo.email}
                </a>
              </>
            )}
            {personalInfo?.linkedin && (
              <>
                <span className="text-slate-400">|</span>
                <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} className="text-[#0366d6] hover:underline" target="_blank" rel="noopener noreferrer">
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </>
            )}
            {personalInfo?.github && (
              <>
                <span className="text-slate-400">|</span>
                <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} className="text-[#0366d6] hover:underline" target="_blank" rel="noopener noreferrer">
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </>
            )}
            {personalInfo?.portfolio && (
              <>
                <span className="text-slate-400">|</span>
                <a href={personalInfo.portfolio.startsWith('http') ? personalInfo.portfolio : `https://${personalInfo.portfolio}`} className="text-[#0366d6] hover:underline" target="_blank" rel="noopener noreferrer">
                  {personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </>
            )}
            {/* Render additional links like LeetCode, HackerRank etc. */}
            {personalInfo?.additionalLinks?.map((link, idx) => (
              <span key={idx} className="inline-flex items-center gap-x-1">
                <span className="text-slate-400">|</span>
                <a href={link.url.startsWith('http') ? link.url : `https://${link.url}`} className="text-[#0366d6] hover:underline" target="_blank" rel="noopener noreferrer">
                  {link.label || link.url.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </span>
            ))}
            {personalInfo?.location && (
              <>
                <span className="text-slate-400">|</span>
                <span>{personalInfo.location}</span>
              </>
            )}
          </div>
        </header>

        {/* ── SUMMARY ── */}
        {summary && (
          <section className="mb-1.5 avoid-break">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Professional Summary
            </h2>
            <p className="text-[9pt] leading-[1.35] text-slate-800">
              {summary}
            </p>
          </section>
        )}

        {/* ── EXPERIENCE ── */}
        {experience && experience.length > 0 && (
          <section className="mb-1.5">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Professional Experience
            </h2>
            <div className="space-y-1">
              {experience.map((exp, idx) => (
                <div key={idx} className="avoid-break">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[9.5pt] font-bold text-slate-900">{exp.title}</h3>
                    <span className="text-[9pt] text-slate-900 whitespace-nowrap">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9pt] italic text-slate-900">{exp.company}</span>
                    <span className="text-[9pt] italic text-slate-900">{exp.location}</span>
                  </div>
                  <ul className="list-disc list-outside ml-5 mt-0.5">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className="text-[9pt] leading-[1.3] text-slate-900 pl-0.5">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── PROJECTS ── */}
        {projects && projects.length > 0 && (
          <section className="mb-1.5">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Projects
            </h2>
            <div className="space-y-1">
              {projects.map((proj, idx) => (
                <div key={idx} className="avoid-break">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[9.5pt] font-bold text-slate-900">
                      {proj.name}
                      {proj.link && (
                        <span className="text-[8.5pt] font-normal text-slate-500 ml-1.5">
                          | <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} className="text-[#0366d6] hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </span>
                      )}
                    </h3>
                  </div>
                  <p className="text-[9pt] leading-[1.3] text-slate-900">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[9pt] text-slate-900"><span className="font-bold italic">Tools:</span> <span className="italic">{proj.technologies.join(', ')}</span></p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── EDUCATION ── */}
        {education && education.length > 0 && (
          <section className="mb-1.5 avoid-break">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Education
            </h2>
            <div className="space-y-1">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[9.5pt] font-bold text-slate-900">{edu.institution}</h3>
                    <p className="text-[9pt] text-slate-900 italic">{edu.degree} {edu.gpa && <span className="font-normal ml-1">| GPA: {edu.gpa}</span>}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9pt] text-slate-900 whitespace-nowrap">{edu.startDate && edu.startDate + ' – '}{edu.endDate}</p>
                    <p className="text-[9pt] italic text-slate-900">{edu.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SKILLS ── */}
        {skills && skills.length > 0 && (
          <section className="mb-1 avoid-break">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Skills
            </h2>
            <div className="space-y-0.5">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex text-[9pt]">
                  <span className="font-bold text-slate-900 w-[130px] shrink-0">{skill.category}:</span>
                  <span className="text-slate-900">{skill.items.join(', ')}</span>
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
