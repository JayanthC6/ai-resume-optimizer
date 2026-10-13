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

export const StructuredResumeTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { personalInfo, summary, experience, education, skills, projects } = data || {};

  return (
    <div
      className="resume-print-root bg-white text-slate-900 mx-auto overflow-hidden rounded-xl border border-slate-200 shadow-sm print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:overflow-visible"
      style={{ maxWidth: '8.5in' }}
    >
      <style type="text/css">
        {`
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
            h1, h2, h3, .section-heading, .resume-header {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            li {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            a {
              text-decoration: underline !important;
              color: #0366d6 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
      <div
        ref={ref}
        className="resume-print-content px-[0.45in] py-[0.3in] print:p-0 w-full text-slate-900 bg-white print:w-full print:max-w-none print:h-auto print:overflow-visible"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {/* ── HEADER ── */}
        <header className="resume-header mb-2 text-center border-b-[1.5px] border-slate-800 pb-1.5 avoid-break">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight capitalize mb-0.5">
            {personalInfo?.name || 'NAME NOT PROVIDED'}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[9.5pt] text-slate-800">
            {personalInfo?.phone && (
              formatPhoneHref(personalInfo.phone) ? (
                <a
                  href={formatPhoneHref(personalInfo.phone)}
                  className="text-slate-800 hover:underline"
                >
                  {personalInfo.phone}
                </a>
              ) : (
                <span>{personalInfo.phone}</span>
              )
            )}
            {personalInfo?.email && (
              <>
                {personalInfo?.phone && <span className="text-slate-400">|</span>}
                {personalInfo.email.trim() ? (
                  <a
                    href={`mailto:${personalInfo.email.trim()}`}
                    className="text-[#0366d6] hover:underline"
                  >
                    {personalInfo.email}
                  </a>
                ) : (
                  <span>{personalInfo.email}</span>
                )}
              </>
            )}
            {personalInfo?.linkedin && (
              <>
                <span className="text-slate-400">|</span>
                {formatLinkUrl(personalInfo.linkedin) ? (
                  <a
                    href={formatLinkUrl(personalInfo.linkedin)}
                    className="text-[#0366d6] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                ) : (
                  <span>{personalInfo.linkedin}</span>
                )}
              </>
            )}
            {personalInfo?.github && (
              <>
                <span className="text-slate-400">|</span>
                {formatLinkUrl(personalInfo.github) ? (
                  <a
                    href={formatLinkUrl(personalInfo.github)}
                    className="text-[#0366d6] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                ) : (
                  <span>{personalInfo.github}</span>
                )}
              </>
            )}
            {personalInfo?.portfolio && (
              <>
                <span className="text-slate-400">|</span>
                {formatLinkUrl(personalInfo.portfolio) ? (
                  <a
                    href={formatLinkUrl(personalInfo.portfolio)}
                    className="text-[#0366d6] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                ) : (
                  <span>{personalInfo.portfolio}</span>
                )}
              </>
            )}
            {/* Render additional links like LeetCode, HackerRank etc. */}
            {(personalInfo?.additionalLinks ?? []).map((link, idx) => {
              const href = formatLinkUrl(link?.url);
              const label = link?.label || (link?.url ? link.url.replace(/^https?:\/\/(www\.)?/, '') : '');
              if (!label) return null;
              return (
                <span key={idx} className="inline-flex items-center gap-x-1">
                  <span className="text-slate-400">|</span>
                  {href ? (
                    <a
                      href={href}
                      className="text-[#0366d6] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
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
            <p className="text-[9pt] leading-[1.35] text-slate-800 break-words">
              {summary}
            </p>
          </section>
        )}

        {/* ── EXPERIENCE ── */}
        {(experience ?? []).length > 0 && (
          <section className="mb-1.5">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Professional Experience
            </h2>
            <div className="space-y-1">
              {(experience ?? []).map((exp, idx) => (
                <div key={idx} className="avoid-break">
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <h3 className="text-[9.5pt] font-bold text-slate-900 flex-1 min-w-0">{exp?.title}</h3>
                    <span className="text-[9pt] text-slate-900 shrink-0 text-right">{exp?.startDate} – {exp?.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <span className="text-[9pt] italic text-slate-900 flex-1 min-w-0">{exp?.company}</span>
                    <span className="text-[9pt] italic text-slate-900 shrink-0 text-right">{exp?.location}</span>
                  </div>
                  <ul className="list-disc list-outside ml-5 mt-0.5">
                    {(exp?.bullets ?? []).map((bullet, i) => (
                      <li key={i} className="text-[9pt] leading-[1.3] text-slate-900 pl-0.5 break-words">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── PROJECTS ── */}
        {(projects ?? []).length > 0 && (
          <section className="mb-1.5">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Projects
            </h2>
            <div className="space-y-1">
              {(projects ?? []).map((proj, idx) => (
                <div key={idx} className="avoid-break">
                  <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                    <h3 className="text-[9.5pt] font-bold text-slate-900 flex-1 min-w-0">
                      {proj?.name || 'Project'}
                      {proj?.link && (
                        <span className="text-[8.5pt] font-normal text-slate-500 ml-1.5">
                          |{' '}
                          {formatLinkUrl(proj.link) ? (
                            <a
                              href={formatLinkUrl(proj.link)}
                              className="text-[#0366d6] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              GitHub
                            </a>
                          ) : (
                            <span>GitHub</span>
                          )}
                        </span>
                      )}
                    </h3>
                  </div>
                  {proj?.description && (
                    <p className="text-[9pt] leading-[1.3] text-slate-900 break-words">{proj.description}</p>
                  )}
                  {(proj?.technologies ?? []).length > 0 && (
                    <p className="text-[9pt] text-slate-900 break-words"><span className="font-bold italic">Tools:</span> <span className="italic">{(proj?.technologies ?? []).join(', ')}</span></p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── EDUCATION ── */}
        {(education ?? []).length > 0 && (
          <section className="mb-1.5 avoid-break">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Education
            </h2>
            <div className="space-y-1">
              {(education ?? []).map((edu, idx) => (
                <div key={idx} className="avoid-break flex justify-between items-start flex-wrap gap-x-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[9.5pt] font-bold text-slate-900">{edu?.institution}</h3>
                    <p className="text-[9pt] text-slate-900 italic">{edu?.degree} {edu?.gpa && <span className="font-normal ml-1">| GPA: {edu.gpa}</span>}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9pt] text-slate-900">{edu?.startDate && edu.startDate + ' – '}{edu?.endDate}</p>
                    <p className="text-[9pt] italic text-slate-900">{edu?.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SKILLS ── */}
        {(skills ?? []).length > 0 && (
          <section className="mb-1 avoid-break">
            <h2 className="text-[10.5pt] font-bold text-slate-900 uppercase tracking-wider border-b-[1px] border-slate-800 mb-1 pb-0.5">
              Skills
            </h2>
            <div className="space-y-0.5">
              {(skills ?? []).map((skill, idx) => (
                <div key={idx} className="avoid-break flex text-[9pt] flex-wrap">
                  <span className="font-bold text-slate-900 w-[130px] shrink-0">{skill?.category}:</span>
                  <span className="text-slate-900 flex-1 min-w-0 break-words">{(skill?.items ?? []).join(', ')}</span>
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
