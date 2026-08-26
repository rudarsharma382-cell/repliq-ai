export function sanitizeGeneratedTsx(code: string) {
  let next = code
    .replace(/\sclass=/g, " className=")
    .replace(/\sfor=/g, " htmlFor=")
    .replace(/href=["']\/[^"']*["']/g, 'href="#"');

  if (!next.includes("from 'react'") && !next.includes('from "react"')) {
    next = `import React, { useState } from 'react';\n${next}`;
  }

  return next;
}
