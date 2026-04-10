const DOCX_MIMETYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

const PPTX_MIMETYPES = new Set([
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
]);

const ALLOWED_MIMETYPES = new Set([
  'text/plain',
  'application/pdf',
  ...DOCX_MIMETYPES,
  ...PPTX_MIMETYPES,
]);

module.exports = { DOCX_MIMETYPES, PPTX_MIMETYPES, ALLOWED_MIMETYPES };
