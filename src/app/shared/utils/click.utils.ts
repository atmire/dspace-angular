/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

export function isLeftButton (event: MouseEvent): boolean {
  console.log(event.button === 0);
  return event.button === 0;
}

export function hasModifierKey (event: MouseEvent): boolean {
  console.log(event.ctrlKey);
  console.log(event.shiftKey);
  console.log(event.altKey);
  console.log(event.metaKey);
  return event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
}
