/* ── MODULE: VALIDATION ── */

function validateEmail(email) {
  const value = (email || "").trim();
  if (!value) {
    return "O e-mail é obrigatório.";
  }
  if (!value.includes("@")) {
    return "O e-mail precisa ter @.";
  }
  if (!value.toLowerCase().includes(".com")) {
    return "O e-mail precisa ter .com.";
  }
  return "";
}

function validatePassword(password) {
  const value = password || "";
  if (!value) {
    return "A senha é obrigatória.";
  }

  const digits = (value.match(/[0-9]/g) || []).length;
  const letters = (value.match(/[A-Za-z]/g) || []).length;
  const specials = (value.match(/[^A-Za-z0-9]/g) || []).length;

  if (digits < 3 || letters < 3 || specials < 1) {
    return "A senha deve ter no mínimo 3 números, 1 caracter especial e 3 letras.";
  }
  return "";
}

function validateFullName(fullName) {
  const value = (fullName || "").trim();
  if (!value) return "O nome e sobrenome é obrigatório.";

  const allowed = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;
  if (!allowed.test(value)) return "Informe nome e sobrenome.";

  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "O nome e sobrenome é obrigatório.";

  return "";
}

function sanitizeFullNameInput(value) {
  const v = String(value || "");
  const onlyLettersAndSpaces = v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
  return onlyLettersAndSpaces.replace(/\s{2,}/g, " ").trimStart();
}

function validateChurch(church) {
  const c = (church || "").trim();
  if (!c) return "Selecione sua igreja.";
  return "";
}

function validatePhone(phone) {
  const value = (phone || "").trim();
  if (!value) return "O telefone é obrigatório.";

  const re = /^\(\d{2}\)\s?9\s?\d{4}-\d{4}$/;
  if (!re.test(value)) return "Telefone inválido. Use o formato (11) 9 1234-1234.";

  return "";
}

function formatPhone(value) {
  const digits = (value || "").replace(/\D/g, "").slice(0, 11);
  return formatPhoneDigits(digits);
}

function formatPhoneDigits(digits) {
  const d = (digits || "").replace(/\D/g, "").slice(0, 11);
  const ddd = d.slice(0, 2);
  const first = d.slice(2, 3);
  const part1 = d.slice(3, 7);
  const part2 = d.slice(7, 11);

  if (!d) return "";

  let out = "";
  if (ddd) out += `(${ddd}`;
  if (d.length >= 3) out += ")";
  if (first) out += ` ${first}`;
  if (part1) out += ` ${part1}`;
  if (part2) out += `-${part2}`;
  return out;
}

function applyPhoneMask(inputEl) {
  const raw = inputEl.value || "";
  const caret = inputEl.selectionStart ?? raw.length;

  const digitsLeft = (raw.slice(0, caret).match(/\d/g) || []).length;
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const formatted = formatPhoneDigits(digits);

  inputEl.value = formatted;

  if (!formatted) return;

  let count = 0;
  let newCaret = formatted.length;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) count += 1;
    if (count >= digitsLeft) {
      newCaret = i + 1;
      break;
    }
  }

  try {
    inputEl.setSelectionRange(newCaret, newCaret);
  } catch (_) { }
}

function validateBirthDate(value) {
  const v = (value || "").trim();
  if (!v) return "Informe sua data de nascimento.";
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return "Data inválida. Use dd/mm/aaaa.";

  const [ddS, mmS, yyyyS] = v.split("/");
  const dd = Number(ddS);
  const mm = Number(mmS);
  const yyyy = Number(yyyyS);

  if (!dd || !mm || !yyyy) return "Data inválida.";
  if (mm < 1 || mm > 12) return "Data inválida.";
  if (yyyy < 1900 || yyyy > new Date().getFullYear()) return "Data inválida.";

  const maxDay = new Date(yyyy, mm, 0).getDate();
  if (dd < 1 || dd > maxDay) return "Data inválida.";

  const birth = new Date(yyyy, mm - 1, dd);
  if (
    birth.getFullYear() !== yyyy ||
    birth.getMonth() !== mm - 1 ||
    birth.getDate() !== dd
  ) {
    return "Data inválida.";
  }

  const today = new Date();
  let age = today.getFullYear() - yyyy;
  const monthDiff = today.getMonth() - (mm - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dd)) {
    age -= 1;
  }

  if (age < 15) return "Idade não permitida!";
  return "";
}

function validateCity(value) {
  const v = (value || "").trim();
  if (!v) return "Selecione sua cidade.";
  return "";
}

function validateRole(value) {
  const v = (value || "").trim();
  if (!v) return "Selecione seu cargo.";
  return "";
}

function validateMinistryYears(value) {
  const v = (value || "").trim();
  if (!v) return "Informe os anos no ministério.";
  if (!/^\d{1,2}$/.test(v)) return "Informe apenas 2 números.";
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0 || n > 99) return "Informe um número entre 0 e 99.";
  return "";
}

function formatBirthDateDigits(digits) {
  const d = (digits || "").replace(/\D/g, "").slice(0, 8);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 4);
  const p3 = d.slice(4, 8);
  if (d.length <= 2) return p1;
  if (d.length <= 4) return `${p1}/${p2}`;
  return `${p1}/${p2}/${p3}`;
}

function applyBirthDateMask(inputEl) {
  if (!inputEl) return;
  const digits = (inputEl.value || "").replace(/\D/g, "");
  const next = formatBirthDateDigits(digits);
  inputEl.value = next;
}
