export const objectsAreEqual = (a, b) => {
  const a_props = Object.getOwnPropertyNames(a);
  const b_props = Object.getOwnPropertyNames(b);

  if (a_props.length != b_props.length) return false;

  for (let i = 0; i < a_props.length; i++) {
    const prop_name = a_props[i];
    if (a[prop_name] !== b[prop_name]) return false;
  }

  return true;
};
