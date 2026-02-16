// Simple SAX-like XML parser
export interface XmlElement {
  name: string;
  attrs: Map<string, string>;
  text?: string;
}

export class XmlSaxParser {
  private decoder = new TextDecoder();

  parse(data: Uint8Array, handlers: {
    onStartElement?: (name: string, attrs: Map<string, string>) => void;
    onEndElement?: (name: string) => void;
    onText?: (text: string) => void;
  }): void {
    const xml = this.decoder.decode(data);
    let pos = 0;
    let inTag = false;
    let tagContent = '';
    let textContent = '';

    while (pos < xml.length) {
      const char = xml[pos];

      if (char === '<') {
        // Save accumulated text
        if (textContent.trim() && handlers.onText) {
          handlers.onText(textContent.trim());
        }
        textContent = '';
        inTag = true;
        tagContent = '';
      } else if (char === '>') {
        inTag = false;

        if (tagContent.startsWith('/')) {
          // End tag
          const tagName = tagContent.substring(1).trim();
          if (handlers.onEndElement) {
            handlers.onEndElement(tagName);
          }
        } else if (tagContent.endsWith('/')) {
          // Self-closing tag
          const { name, attrs } = this.parseTag(tagContent.substring(0, tagContent.length - 1));
          if (handlers.onStartElement) {
            handlers.onStartElement(name, attrs);
          }
          if (handlers.onEndElement) {
            handlers.onEndElement(name);
          }
        } else if (!tagContent.startsWith('?') && !tagContent.startsWith('!')) {
          // Start tag
          const { name, attrs } = this.parseTag(tagContent);
          if (handlers.onStartElement) {
            handlers.onStartElement(name, attrs);
          }
        }

        tagContent = '';
      } else {
        if (inTag) {
          tagContent += char;
        } else {
          textContent += char;
        }
      }

      pos++;
    }
  }

  private parseTag(content: string): { name: string; attrs: Map<string, string> } {
    const parts = content.trim().split(/\s+/);
    const name = parts[0];
    const attrs = new Map<string, string>();

    // Parse attributes
    const attrStr = content.substring(name.length).trim();
    const attrRegex = /(\w+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(attrStr)) !== null) {
      attrs.set(match[1], match[2]);
    }

    return { name, attrs };
  }

  static parseSimple(xml: string): XmlElement[] {
    const elements: XmlElement[] = [];
    const stack: XmlElement[] = [];
    let pos = 0;

    while (pos < xml.length) {
      const tagStart = xml.indexOf('<', pos);
      if (tagStart === -1) break;

      const tagEnd = xml.indexOf('>', tagStart);
      if (tagEnd === -1) break;

      const tagContent = xml.substring(tagStart + 1, tagEnd);

      if (tagContent.startsWith('/')) {
        // End tag
        if (stack.length > 0) {
          const elem = stack.pop()!;
          elements.push(elem);
        }
      } else if (tagContent.endsWith('/') || tagContent.startsWith('?') || tagContent.startsWith('!')) {
        // Self-closing or declaration
        if (!tagContent.startsWith('?') && !tagContent.startsWith('!')) {
          const parser = new XmlSaxParser();
          const { name, attrs } = parser['parseTag'](tagContent.substring(0, tagContent.length - 1));
          elements.push({ name, attrs });
        }
      } else {
        // Start tag
        const parser = new XmlSaxParser();
        const { name, attrs } = parser['parseTag'](tagContent);
        stack.push({ name, attrs });
      }

      pos = tagEnd + 1;
    }

    return elements;
  }
}
