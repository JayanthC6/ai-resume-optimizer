import React, { forwardRef } from 'react';
import type { StructuredResume } from '@repo/types';

type Props = {
  data: StructuredResume;
};

function formatLinkUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function renderFormattedText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

const SERIF_FONT_STACK =
  "'Latin Modern Roman', 'CMU Serif', 'Computer Modern', Georgia, 'Times New Roman', serif";

export const LatexResumeTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { personalInfo, summary, experience, education, skills, projects, achievements } = data || {};

  // Build contact line items
  const contactItems: React.ReactNode[] = [];

  if (personalInfo?.phone) {
    contactItems.push(<span key="phone">{personalInfo.phone}</span>);
  }

  if (personalInfo?.email) {
    const email = personalInfo.email.trim();
    contactItems.push(
      email ? (
        <a key="email" href={`mailto:${email}`} className="underline text-black hover:opacity-80">
          {email}
        </a>
      ) : (
        <span key="email">{personalInfo.email}</span>
      ),
    );
  }

  if (personalInfo?.linkedin) {
    const href = formatLinkUrl(personalInfo.linkedin);
    contactItems.push(
      href ? (
        <a
          key="linkedin"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-black hover:opacity-80"
        >
          LinkedIn
        </a>
      ) : (
        <span key="linkedin">LinkedIn</span>
      ),
    );
  }

  if (personalInfo?.github) {
    const href = formatLinkUrl(personalInfo.github);
    contactItems.push(
      href ? (
        <a
          key="github"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-black hover:opacity-80"
        >
          GitHub
        </a>
      ) : (
        <span key="github">GitHub</span>
      ),
    );
  }

  (personalInfo?.additionalLinks ?? []).forEach((link, idx) => {
    const href = formatLinkUrl(link?.url);
    const label = link?.label || link?.url || 'Link';
    if (!label && !href) return;
    contactItems.push(
      href ? (
        <a
          key={`add-${idx}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-black hover:opacity-80"
        >
          {label}
        </a>
      ) : (
        <span key={`add-${idx}`}>{label}</span>
      ),
    );
  });

  if (personalInfo?.portfolio) {
    const href = formatLinkUrl(personalInfo.portfolio);
    contactItems.push(
      href ? (
        <a
          key="portfolio"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-black hover:opacity-80"
        >
          Portfolio
        </a>
      ) : (
        <span key="portfolio">Portfolio</span>
      ),
    );
  }

  if (personalInfo?.location) {
    contactItems.push(
      <span key="location" className="whitespace-nowrap">
        {personalInfo.location}
      </span>,
    );
  }

  return (
    <div
      className="resume-print-root bg-white text-black mx-auto overflow-hidden shadow-sm min-h-[11in] print:min-h-0 print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:overflow-visible"
      style={{ maxWidth: '8.5in' }}
    >
      <style type="text/css">
        {`
          .latex-font {
            font-family: ${SERIF_FONT_STACK};
            font-size: 9.5pt;
            line-height: 1.25;
            color: black;
          }
          
          .small-caps {
            font-variant: small-caps;
          }
          
          .latex-section-rule {
            font-variant: small-caps;
            border-bottom: 0.75pt solid black;
            margin-bottom: 3pt;
            padding-bottom: 1pt;
          }

          @page {
            size: letter portrait;
            margin: 0;
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
              padding: 0.5in !important;
              overflow: visible !important;
              box-sizing: border-box !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              background: #ffffff !important;
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
            h1, h2, h3, .avoid-break-after, .latex-section-rule, .resume-header {
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
        className="resume-print-content latex-font p-[0.5in] print:p-[0.5in] bg-white w-full text-black print:w-full print:max-w-none print:h-auto print:overflow-visible"
        style={{ fontFamily: SERIF_FONT_STACK }}
      >
        {/* HEADER */}
        <div className="resume-header text-center mb-2 avoid-break">
          <h1 className="text-[16pt] font-bold uppercase small-caps mb-0.5 tracking-wide">
            {personalInfo?.name || 'NAME NOT PROVIDED'}
          </h1>
          <div className="text-[9pt] flex justify-center items-center flex-wrap gap-x-1.5 leading-tight">
            {contactItems.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-x-1.5 whitespace-nowrap">
                {idx > 0 && <span className="text-black select-none">|</span>}
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* SUMMARY: plain justified paragraph right under contact line with NO heading */}
        {summary && summary.trim().length > 0 && (
          <div className="avoid-break mt-2 mb-2.5">
            <p className="text-[9.5pt] leading-snug text-justify break-words">
              {summary}
            </p>
          </div>
        )}

        {/* 1. EDUCATION */}
        {(education ?? []).length > 0 && (
          <section className="mb-2.5">
            <div className="avoid-break-after">
              <h2 className="text-[10.5pt] font-bold uppercase latex-section-rule">
                Education
              </h2>
            </div>
            <div className="space-y-1.5">
              {(education ?? []).map((edu, idx) => (
                <div key={idx} className="avoid-break text-[9.5pt]">
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <span className="font-bold flex-1 min-w-0">{edu?.institution}</span>
                    <span className="text-right shrink-0">{edu?.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline italic flex-wrap gap-x-2">
                    <span className="flex-1 min-w-0">
                      {edu?.degree}
                      {edu?.gpa && <span>, CGPA: {edu.gpa}</span>}
                    </span>
                    <span className="text-right shrink-0">
                      {edu?.startDate ? `${edu.startDate} – ` : ''}{edu?.endDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. TECHNICAL SKILLS */}
        {(skills ?? []).length > 0 && (
          <section className="mb-2.5">
            <div className="avoid-break-after">
              <h2 className="text-[10.5pt] font-bold uppercase latex-section-rule">
                Technical Skills
              </h2>
            </div>
            <div className="space-y-0.5 text-[9.5pt]">
              {(skills ?? []).map((s, idx) => (
                <div key={idx} className="avoid-break leading-snug">
                  <strong className="font-bold">{s?.category}: </strong>
                  <span>{(s?.items ?? []).join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. EXPERIENCE */}
        {(experience ?? []).length > 0 && (
          <section className="mb-2.5">
            <div className="avoid-break-after">
              <h2 className="text-[10.5pt] font-bold uppercase latex-section-rule">
                Experience
              </h2>
            </div>
            <div className="space-y-2">
              {(experience ?? []).map((exp, idx) => (
                <div key={idx} className="avoid-break text-[9.5pt]">
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <span className="font-bold flex-1 min-w-0">{exp?.company}</span>
                    <span className="text-right shrink-0">{exp?.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline italic flex-wrap gap-x-2 mb-0.5">
                    <span className="flex-1 min-w-0">{exp?.title}</span>
                    <span className="text-right shrink-0">
                      {exp?.startDate ? `${exp.startDate} – ` : ''}{exp?.endDate}
                    </span>
                  </div>
                  {(exp?.bullets ?? []).length > 0 && (
                    <ul className="space-y-0.5 mt-0.5">
                      {(exp?.bullets ?? []).map((bullet, i) => (
                        <li key={i} className="avoid-break flex items-start leading-snug">
                          <span className="mr-1.5 shrink-0 select-none font-bold">–</span>
                          <span className="flex-1 min-w-0 break-words">{renderFormattedText(bullet)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. PROJECTS */}
        {(projects ?? []).length > 0 && (
          <section className="mb-2.5">
            <div className="avoid-break-after">
              <h2 className="text-[10.5pt] font-bold uppercase latex-section-rule">
                Projects
              </h2>
            </div>
            <div className="space-y-2">
              {(projects ?? []).map((proj, idx) => {
                const bullets =
                  proj?.bullets && proj.bullets.length > 0
                    ? proj.bullets
                    : proj?.description
                      ? [proj.description]
                      : [];

                return (
                  <div key={idx} className="avoid-break text-[9.5pt]">
                    <div className="flex justify-between items-baseline flex-wrap gap-x-2 mb-0.5">
                      <div className="flex items-baseline flex-wrap gap-x-1.5 flex-1 min-w-0">
                        <span className="font-bold">{proj?.name || 'Project'}</span>
                        {proj?.githubUrl && (
                          <a
                            href={formatLinkUrl(proj.githubUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-black hover:opacity-80 font-normal"
                          >
                            [GitHub]
                          </a>
                        )}
                        {proj?.liveUrl && (
                          <a
                            href={formatLinkUrl(proj.liveUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-black hover:opacity-80 font-normal"
                          >
                            [Live]
                          </a>
                        )}
                        {!proj?.githubUrl && !proj?.liveUrl && proj?.link && (
                          <a
                            href={formatLinkUrl(proj.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-black hover:opacity-80 font-normal"
                          >
                            {/github\.com/i.test(proj.link) ? '[GitHub]' : '[Live]'}
                          </a>
                        )}
                      </div>
                      {(proj?.technologies ?? []).length > 0 && (
                        <span className="font-bold italic text-right shrink-0">
                          {(proj?.technologies ?? []).join(', ')}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul className="space-y-0.5 mt-0.5">
                        {bullets.map((b, i) => (
                          <li key={i} className="avoid-break flex items-start leading-snug">
                            <span className="mr-1.5 shrink-0 select-none font-bold">–</span>
                            <span className="flex-1 min-w-0 break-words">{renderFormattedText(b)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. ACHIEVEMENTS & EXTRACURRICULARS */}
        {(achievements ?? []).length > 0 && (
          <section className="mb-2.5">
            <div className="avoid-break-after">
              <h2 className="text-[10.5pt] font-bold uppercase latex-section-rule">
                Achievements & Extracurriculars
              </h2>
            </div>
            <ul className="space-y-1 text-[9.5pt]">
              {(achievements ?? []).map((ach, idx) => (
                <li key={idx} className="avoid-break flex items-start leading-snug">
                  <span className="mr-1.5 shrink-0 select-none font-bold">–</span>
                  <div className="flex-1 min-w-0 break-words">
                    {ach?.label && <strong className="font-bold">{ach.label} – </strong>}
                    <span>{renderFormattedText(ach?.text || '')}</span>
                    {ach?.githubUrl && (
                      <>
                        {' '}
                        <a
                          href={formatLinkUrl(ach.githubUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-black hover:opacity-80 font-normal"
                        >
                          [GitHub]
                        </a>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
});

LatexResumeTemplate.displayName = 'LatexResumeTemplate';

