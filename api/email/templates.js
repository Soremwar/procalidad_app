import HtmlEncoder from "html-entities";

export const createGenericEmail = async (content) => {
  const html = new HtmlEncoder.AllHtmlEntities();
  const html_content = html.encode(String(content));

  const layout = new TextDecoder("utf-8").decode(
    await Deno.readFileSync(
      new URL("./templates/generic.html", import.meta.url).pathname,
    ),
  );

  return layout.replace("#content", html_content);
};
