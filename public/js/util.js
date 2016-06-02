var formatSi = d3.format("s");

function formatAbbreviation(x) {
  var s = formatSi(x);
  switch (s[s.length - 1]) {
    case "G": return s.slice(0, -1) + "B";
  }
  return s;
}
