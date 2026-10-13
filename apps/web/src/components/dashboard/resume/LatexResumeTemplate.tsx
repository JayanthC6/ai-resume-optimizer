import { forwardRef } from 'react';
import type { StructuredResume } from '@repo/types';

type Props = {
  data: StructuredResume;
};

function formatLinkUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatPhoneHref(phone?: string): string {
  if (!phone) return '';
  const sanitized = phone.replace(/[^+\d]/g, '');
  return `tel:${sanitized || phone.trim()}`;
}

export const LatexResumeTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { personalInfo, summary, experience, education, skills, projects } = data || {};

  return (
    <div
      className="resume-print-root bg-white text-black mx-auto overflow-hidden shadow-sm min-h-[11in] print:min-h-0 print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:overflow-visible"
      style={{ maxWidth: '8.5in' }}
    >
      <style type="text/css">
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

          @page {
            size: letter portrait;
            margin: 0.5in;
          }

          @media print {
            html, body {
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            aside, nav, header:not(.resume-header), footer, button, [role="navigation"], .no-print {
              display: none !important;
            }
            .resume-print-root {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              min-height: 0 !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: visible !important;
              background: transparent !important;
            }
            .resume-print-content {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              min-height: 0 !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              box-sizing: border-box !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            * {
              box-sizing: border-box !important;
            }
            p, li, span, h1, h2, h3, div {
              overflow-wrap: break-word !important;
              word-break: normal !important;
            }
            .avoid-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            h1, h2, h3, .latex-section-rule, .resume-header {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            li {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            a {
              color: black !important;
              text-decoration: underline !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
      
      <div 
        ref={ref} 
        className="resume-print-content latex-font px-[0.65in] py-[0.65in] print:p-0 bg-white w-full text-black print:w-full print:max-w-none print:h-auto print:overflow-visible"
      >
        {/* HEADING */}
        <div className="resume-header text-center mb-5 print:mb-3 avoid-break">
          <h1 className="text-[14pt] font-extrabold uppercase small-caps mb-1">
            {personalInfo?.name || 'NAME NOT PROVIDED'}
          </h1>
          <div className="text-[9pt] flex justify-center gap-2 flex-wrap items-center">
            {personalInfo?.phone && (
              formatPhoneHref(personalInfo.phone) ? (
                <a
                  href={formatPhoneHref(personalInfo.phone)}
                  className="text-black no-underline hover:underline"
                >
                  {personalInfo.phone}
                </a>
              ) : (
                <span>{personalInfo.phone}</span>
              )
            )}
            {personalInfo?.phone && personalInfo?.email && <span>|</span>}
            {personalInfo?.email && (
              personalInfo.email.trim() ? (
                <a
                  href={`mailto:${personalInfo.email.trim()}`}
                  className="underline hover:opacity-80 text-black"
                >
                  {personalInfo.email}
                </a>
              ) : (
                <span>{personalInfo.email}</span>
              )
            )}
            {personalInfo?.linkedin && (
              <>
                <span>|</span>
                {formatLinkUrl(personalInfo.linkedin) ? (
                  <a
                    href={formatLinkUrl(personalInfo.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 text-black"
                  >
                    LinkedIn
                  </a>
                ) : (
                  <span>LinkedIn</span>
                )}
              </>
            )}
            {personalInfo?.github && (
              <>
                <span>|</span>
                {formatLinkUrl(personalInfo.github) ? (
                  <a
                    href={formatLinkUrl(personalInfo.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 text-black"
                  >
                    GitHub
                  </a>
                ) : (
                  <span>GitHub</span>
                )}
              </>
            )}
            {personalInfo?.portfolio && (
              <>
                <span>|</span>
                {formatLinkUrl(personalInfo.portfolio) ? (
                  <a
                    href={formatLinkUrl(personalInfo.portfolio)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 text-black"
                  >
                    Portfolio
                  </a>
                ) : (
                  <span>Portfolio</span>
                )}
              </>
            )}
            {(personalInfo?.additionalLinks ?? []).map((link, idx) => {
              const href = formatLinkUrl(link?.url);
              const label = link?.label || link?.url;
              if (!label) return null;
              return (
                <span key={idx} className="inline-flex items-center gap-1">
                  <span>|</span>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80 text-black"
                    >
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </span>
              );
            })}
            {personalInfo?.location && (
              <>
                <span>|</span>
                <span>{personalInfo.location}</span>
              </>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        {summary && (
          <div className="avoid-break mb-4 print:mb-2.5">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Professional Summary
            </h2>
            <p className="text-[9.5pt] leading-snug text-justify break-words">
              {summary}
            </p>
          </div>
        )}

        {/* EXPERIENCE */}
        {(experience ?? []).length > 0 && (
          <div className="mb-4 print:mb-2.5">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Experience
            </h2>
            <div className="space-y-4 print:space-y-2.5">
              {(experience ?? []).map((exp, idx) => (
                <div key={idx} className="avoid-break">
                  <div className="flex justify-between items-baseline font-bold flex-wrap gap-x-2">
                    <span className="flex-1 min-w-0">{exp?.company}</span>
                    <span className="text-right shrink-0">{exp?.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-[9.5pt] mb-1 flex-wrap gap-x-2">
                    <span className="flex-1 min-w-0">{exp?.title}</span>
                    <span className="text-right shrink-0">{exp?.startDate} -- {exp?.endDate}</span>
                  </div>
                  <ul className="latex-item-list text-[9.5pt]">
                    {(exp?.bullets ?? []).map((bullet, i) => (
                      <li key={i} className="break-words">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {(projects ?? []).length > 0 && (
          <div className="mb-4 print:mb-2.5">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Projects
            </h2>
            <div className="space-y-3 print:space-y-2">
              {(projects ?? []).map((proj, idx) => (
                <div key={idx} className="avoid-break">
                  <div className="flex justify-between items-baseline mb-1 flex-wrap gap-x-2">
                    <span className="font-bold flex-1 min-w-0 break-words">
                      {proj?.name || 'Project'} 
                      {(proj?.technologies ?? []).length > 0 && (
                        <span className="font-normal italic"> | {(proj?.technologies ?? []).join(', ')}</span>
                      )}
                    </span>
                    {proj?.link && (
                      formatLinkUrl(proj.link) ? (
                        <a
                          href={formatLinkUrl(proj.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9pt] underline italic text-black hover:opacity-80 shrink-0"
                        >
                          Live Link
                        </a>
                      ) : (
                        <span className="text-[9pt] italic shrink-0">Live Link</span>
                      )
                    )}
                  </div>
                  <ul className="latex-item-list text-[9.5pt]">
                    {proj?.description && <li className="break-words">{proj.description}</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {(education ?? []).length > 0 && (
          <div className="mb-4 print:mb-2.5">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Education
            </h2>
            <div className="space-y-3 print:space-y-2">
              {(education ?? []).map((edu, idx) => (
                <div key={idx} className="avoid-break">
                  <div className="flex justify-between items-baseline font-bold flex-wrap gap-x-2">
                    <span className="flex-1 min-w-0">{edu?.institution}</span>
                    <span className="text-right shrink-0">{edu?.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-[9.5pt] flex-wrap gap-x-2">
                    <span className="flex-1 min-w-0">{edu?.degree} {edu?.gpa && <span className="font-normal not-italic ml-2">| GPA: {edu.gpa}</span>}</span>
                    <span className="text-right shrink-0">{edu?.startDate ? edu.startDate + ' -- ' : ''} {edu?.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS */}
        {(skills ?? []).length > 0 && (
          <div className="avoid-break mb-4 print:mb-2.5">
            <h2 className="text-[11pt] font-bold uppercase small-caps latex-section-rule">
              Skills
            </h2>
            <div className="space-y-1">
              {(skills ?? []).map((s, idx) => (
                <div key={idx} className="avoid-break text-[9.5pt] flex flex-wrap">
                  <span className="font-bold shrink-0 mr-1.5">{s?.category}:</span>
                  <span className="flex-1 min-w-0 break-words">{(s?.items ?? []).join(', ')}</span>
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
