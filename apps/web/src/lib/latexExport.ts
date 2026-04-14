import type { StructuredResume } from '@repo/types';

/**
 * Escapes special LaTeX characters in a string.
 */
function escapeLatex(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/%/g, '\\%')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Generates the raw LaTeX code for a provided StructuredResume based on the design template.
 */
export function generateLatexCode(data: StructuredResume): string {
  const { personalInfo, summary, experience, education, skills, projects } = data;

  let latex = `\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{setspace}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\input{glyphtounicode}

%----------MARGIN & ALIGNMENT SETTINGS----------
\\addtolength{\\oddsidemargin}{-0.65in}
\\addtolength{\\evensidemargin}{-0.65in}
\\addtolength{\\textwidth}{1.3in}
\\addtolength{\\topmargin}{-0.65in}
\\addtolength{\\textheight}{1.3in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

%----------SECTION STYLING----------
\\titleformat{\\section}{\\vspace{-5pt}\\scshape\\raggedright\\large\\bfseries}{}{0em}{}[\\color{black}\\titlerule \\vspace{-4pt}]
\\pdfgentounicode=1

%----------CUSTOM COMMANDS----------
\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-1pt}}}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\vspace{-1pt}\\item\\textbf{#1} \\hfill \\small \\textit{#2}\\vspace{-5pt}
}

%----------DOCUMENT STRUCTURE----------
\\begin{document}
\\begin{spacing}{0.95}

% HEADING AREA
\\begin{center}
    \\textbf{\\Large \\scshape ${escapeLatex(personalInfo.name)}} \\\\ \\vspace{3pt}
    \\small ${escapeLatex(personalInfo.phone)} $|$ 
    \\href{mailto:${personalInfo.email}}{${escapeLatex(personalInfo.email)}} $|$ 
    ${personalInfo.linkedin ? `\\href{${personalInfo.linkedin}}{LinkedIn} $|$ ` : ''}
    ${personalInfo.github ? `\\href{${personalInfo.github}}{GitHub} $|$ ` : ''}
    ${personalInfo.portfolio ? `\\href{${personalInfo.portfolio}}{Portfolio} $|$ ` : ''}
    ${personalInfo.additionalLinks?.map(link => `\\href{${link.url}}{${escapeLatex(link.label)}} $|$ `).join('')}
    ${escapeLatex(personalInfo.location)}
\\end{center}

% SUMMARY SECTION
${summary ? `
\\section{Professional Summary}
\\small{${escapeLatex(summary)}}
` : ''}

% EXPERIENCE SECTION
${experience && experience.length > 0 ? `
\\section{Experience}
\\begin{itemize}[leftmargin=0.15in, label={}]
${experience.map(exp => `
    \\resumeSubheading
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}
      {${escapeLatex(exp.title)}}{${escapeLatex(exp.startDate)} -- ${escapeLatex(exp.endDate)}}
      \\begin{itemize}[leftmargin=0.2in]
${exp.bullets.map(bullet => `        \\resumeItem{${escapeLatex(bullet)}}`).join('\n')}
      \\end{itemize}
`).join('')}
\\end{itemize}
` : ''}

% PROJECTS SECTION
${projects && projects.length > 0 ? `
\\section{Projects}
\\begin{itemize}[leftmargin=0.15in, label={}]
${projects.map(proj => `
    \\resumeProjectHeading
      {${escapeLatex(proj.name)} ${proj.technologies ? `$|$ \\emph{${escapeLatex(proj.technologies.join(', '))}}` : ''}}{${proj.link ? `\\href{${proj.link}}{Live Link}` : ''}}
      \\begin{itemize}[leftmargin=0.2in]
        \\resumeItem{${escapeLatex(proj.description)}}
      \\end{itemize}
`).join('')}
\\end{itemize}
` : ''}

% EDUCATION SECTION
${education && education.length > 0 ? `
\\section{Education}
\\begin{itemize}[leftmargin=0.15in, label={}]
${education.map(edu => `
    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{${escapeLatex(edu.location)}}
      {${escapeLatex(edu.degree)} ${edu.gpa ? `$|$ GPA: ${escapeLatex(edu.gpa)}` : ''}}{${edu.startDate ? escapeLatex(edu.startDate) + ' -- ' : ''}${escapeLatex(edu.endDate)}}
`).join('')}
\\end{itemize}
` : ''}

% SKILLS SECTION
${skills && skills.length > 0 ? `
\\section{Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     ${skills.map(s => `\\textbf{${escapeLatex(s.category)}}: {${escapeLatex(s.items.join(', '))}}`).join(' \\\\\\\\ \n ')}
    }}
 \\end{itemize}
` : ''}

\\end{spacing}
\\end{document}
`;

  return latex;
}

/**
 * Trigger a browser download of the generated LaTeX file.
 */
export function downloadLatexFile(data: StructuredResume) {
  const code = generateLatexCode(data);
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.tex`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
