export function renderTemplate(
  template: string,
  vars: { name?: string; company?: string }
) {
  return template
    .replace(/{{\s*name\s*}}/g, vars.name ?? '')
    .replace(/{{\s*company\s*}}/g, vars.company ?? '');
}
