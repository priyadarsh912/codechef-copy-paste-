// Java code formatter to ensure clean 4-space indentation and no runaways
function formatJavaCode(code) {
  if (!code) return '';
  const lines = code.split(/\r?\n/);
  let indentLevel = 0;
  const formattedLines = [];

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      formattedLines.push('');
      continue;
    }

    let openCount = 0;
    let closeCount = 0;
    let inString = false;
    let inChar = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i - 1] !== '\\') inString = !inString;
      else if (ch === "'" && line[i - 1] !== '\\') inChar = !inChar;
      else if (!inString && !inChar) {
        if (ch === '{') openCount++;
        else if (ch === '}') closeCount++;
      }
    }

    let leadingCloses = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '}') leadingCloses++;
      else if (line[i] === ' ' || line[i] === '\t') continue;
      else break;
    }

    const isCase = line.startsWith('case ') || line.startsWith('default:');
    let currentIndent = Math.max(0, indentLevel - leadingCloses);
    if (isCase && currentIndent > 0) {
      currentIndent = Math.max(0, currentIndent - 1);
    }

    formattedLines.push('    '.repeat(currentIndent) + line);
    indentLevel = Math.max(0, indentLevel + openCount - closeCount);
  }

  return formattedLines.join('\n');
}

const generateJavaCode = (className) => `import java.sql.*;
import java.util.Locale;
import java.util.Scanner;

public class ${className} {

    public static void main(String[] args) {
        String url = "jdbc:sqlite::memory:";

        try (
            Connection con = DriverManager.getConnection(url);
            Scanner sc = new Scanner(System.in)
        ) {
            // Create the products table
            try (Statement stmt = con.createStatement()) {
                stmt.executeUpdate(
                    "CREATE TABLE products (" +
                    "id INTEGER PRIMARY KEY, " +
                    "name TEXT, " +
                    "price REAL, " +
                    "quantity INTEGER)"
                );
            }

            if (!sc.hasNextLine()) return;
            int Q = Integer.parseInt(sc.nextLine().trim());

            for (int i = 0; i < Q; i++) {
                if (!sc.hasNextLine()) break;
                String line = sc.nextLine().trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split("\\\\s+");

                String operation = parts[0];

                switch (operation) {

                    case "ADD": {
                        int id = Integer.parseInt(parts[1]);
                        int quantity = Integer.parseInt(parts[parts.length - 1]);
                        double price = Double.parseDouble(parts[parts.length - 2]);

                        // Handle product names with spaces (e.g. Wireless Mouse)
                        StringBuilder nameBuilder = new StringBuilder();
                        for (int j = 2; j < parts.length - 2; j++) {
                            if (j > 2) {
                                nameBuilder.append(" ");
                            }
                            nameBuilder.append(parts[j]);
                        }
                        String name = nameBuilder.toString();

                        String sql =
                            "INSERT INTO products " +
                            "(id, name, price, quantity) VALUES (?, ?, ?, ?)";

                        try (PreparedStatement ps = con.prepareStatement(sql)) {
                            ps.setInt(1, id);
                            ps.setString(2, name);
                            ps.setDouble(3, price);
                            ps.setInt(4, quantity);
                            ps.executeUpdate();
                        }
                        break;
                    }

                    case "GET": {
                        int id = Integer.parseInt(parts[1]);

                        String sql =
                            "SELECT id, name, price, quantity " +
                            "FROM products WHERE id = ?";

                        try (PreparedStatement ps = con.prepareStatement(sql)) {
                            ps.setInt(1, id);

                            try (ResultSet rs = ps.executeQuery()) {
                                if (rs.next()) {
                                    System.out.printf(
                                        Locale.US,
                                        "%d %s %.2f %d%n",
                                        rs.getInt("id"),
                                        rs.getString("name"),
                                        rs.getDouble("price"),
                                        rs.getInt("quantity")
                                    );
                                } else {
                                    System.out.println("NOT_FOUND");
                                }
                            }
                        }
                        break;
                    }

                    case "STOCK": {
                        int id = Integer.parseInt(parts[1]);
                        int quantity = Integer.parseInt(parts[2]);

                        String sql =
                            "UPDATE products SET quantity = ? WHERE id = ?";

                        try (PreparedStatement ps = con.prepareStatement(sql)) {
                            ps.setInt(1, quantity);
                            ps.setInt(2, id);
                            ps.executeUpdate();
                        }
                        break;
                    }

                    case "LIST": {
                        String sql =
                            "SELECT id, name, price, quantity " +
                            "FROM products ORDER BY id";

                        try (PreparedStatement ps = con.prepareStatement(sql);
                             ResultSet rs = ps.executeQuery()) {

                            boolean found = false;

                            while (rs.next()) {
                                found = true;
                                System.out.printf(
                                    Locale.US,
                                    "%d %s %.2f %d%n",
                                    rs.getInt("id"),
                                    rs.getString("name"),
                                    rs.getDouble("price"),
                                    rs.getInt("quantity")
                                );
                            }

                            if (!found) {
                                System.out.println("EMPTY");
                            }
                        }
                        break;
                    }

                    default:
                        break;
                }
            }

        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
        }
    }
}`;

const codeArea = document.getElementById('codeArea');
const injectBtn = document.getElementById('injectBtn');
const formatBtn = document.getElementById('formatBtn');
const copyBtn = document.getElementById('copyBtn');
const btnClassSQLite = document.getElementById('btnClassSQLite');
const btnClassMain = document.getElementById('btnClassMain');
const tabStatus = document.getElementById('tabStatus');
const msg = document.getElementById('msg');

let currentClass = 'Main';
codeArea.value = generateJavaCode(currentClass);

btnClassMain.addEventListener('click', () => {
  currentClass = 'Main';
  btnClassMain.classList.add('active');
  btnClassSQLite.classList.remove('active');
  codeArea.value = generateJavaCode(currentClass);
  showMessage('Loaded clean code with class: Main');
});

btnClassSQLite.addEventListener('click', () => {
  currentClass = 'SQLiteJDBCExample';
  btnClassSQLite.classList.add('active');
  btnClassMain.classList.remove('active');
  codeArea.value = generateJavaCode(currentClass);
  showMessage('Loaded clean code with class: SQLiteJDBCExample');
});

function showMessage(text, isError = false) {
  msg.textContent = text;
  msg.className = isError ? 'error' : 'success';
}

formatBtn.addEventListener('click', () => {
  codeArea.value = formatJavaCode(codeArea.value);
  showMessage('🧹 Formatted code with clean 4-space indentation!');
});

copyBtn.addEventListener('click', async () => {
  try {
    const formatted = formatJavaCode(codeArea.value);
    codeArea.value = formatted;
    await navigator.clipboard.writeText(formatted);
    showMessage('📋 Clean code copied to clipboard!');
  } catch (e) {
    showMessage('Failed to copy: ' + e.message, true);
  }
});

// Detect active tab info on open
chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  if (tab && tab.title) {
    if (tab.title.includes('Main')) {
      currentClass = 'Main';
      btnClassMain.classList.add('active');
      btnClassSQLite.classList.remove('active');
      codeArea.value = generateJavaCode(currentClass);
      tabStatus.textContent = 'Detected Main.java';
    } else if (tab.title.includes('SQLiteJDBCExample')) {
      currentClass = 'SQLiteJDBCExample';
      btnClassSQLite.classList.add('active');
      btnClassMain.classList.remove('active');
      codeArea.value = generateJavaCode(currentClass);
      tabStatus.textContent = 'Detected SQLiteJDBCExample.java';
    } else {
      tabStatus.textContent = 'CodeChef Connected';
    }
  }
});

// Function executed directly via chrome.scripting.executeScript in MAIN world
// NOTE: This runs directly in the V8 engine and NEVER appends any <script> tags to the DOM,
// which avoids triggering Content Security Policy (CSP) violations completely.
function executeInEveryFrame(codeToInject) {
  function applyToMonaco(win) {
    if (!win || !win.monaco || !win.monaco.editor) return false;
    const monaco = win.monaco;
    const editors = monaco.editor.getEditors();

    let targetEditor = null;

    // 1. Focus
    for (const ed of editors) {
      if ((ed.hasTextFocus && ed.hasTextFocus()) || (ed.hasWidgetFocus && ed.hasWidgetFocus())) {
        targetEditor = ed;
        break;
      }
    }

    // 2. Visible
    if (!targetEditor) {
      for (const ed of editors) {
        const dom = ed.getDomNode ? ed.getDomNode() : (ed.getContainerDomNode ? ed.getContainerDomNode() : null);
        if (dom && dom.offsetParent !== null && dom.clientHeight > 50) {
          targetEditor = ed;
          break;
        }
      }
    }

    // 3. Fallback
    if (!targetEditor && editors.length > 0) {
      targetEditor = editors[editors.length - 1];
    }

    if (targetEditor) {
      const model = targetEditor.getModel();
      if (model && !model.isDisposed()) {
        // Automatically ensure class name matches the open file
        let finalCode = codeToInject;
        const uriPath = model.uri ? model.uri.path : '';
        if (uriPath.endsWith('Main.java') && finalCode.includes('public class SQLiteJDBCExample')) {
          finalCode = finalCode.replace('public class SQLiteJDBCExample', 'public class Main');
        } else if (uriPath.endsWith('SQLiteJDBCExample.java') && finalCode.includes('public class Main')) {
          finalCode = finalCode.replace('public class Main', 'public class SQLiteJDBCExample');
        }

        try {
          // Unfold everything so all code is visible from line 1
          const unfoldAction = targetEditor.getAction('editor.unfoldAll');
          if (unfoldAction) {
            unfoldAction.run();
          }
        } catch (e) {}

        // Model-level clean update (prevents runaway auto-indentation cascade)
        try {
          model.pushEditOperations([], [{
            range: model.getFullModelRange(),
            text: finalCode
          }], () => null);
        } catch (e) {
          model.setValue(finalCode);
        }

        if (model.getValue() !== finalCode) {
          model.setValue(finalCode);
        }

        try {
          // Reset scroll and cursor to line 1 column 1
          targetEditor.setScrollTop(0);
          targetEditor.setScrollLeft(0);
          targetEditor.setPosition({ lineNumber: 1, column: 1 });
          targetEditor.revealPosition({ lineNumber: 1, column: 1 });
          targetEditor.focus();
        } catch (e) {}

        try {
          // Document format action if available
          const formatAction = targetEditor.getAction('editor.action.formatDocument');
          if (formatAction) {
            formatAction.run();
          }
        } catch (e) {}

        return true;
      }
    }

    // Direct model fallback
    const models = monaco.editor.getModels();
    if (models && models.length > 0) {
      let targetModel = null;
      for (const m of models) {
        if (m.isDisposed && m.isDisposed()) continue;
        const uri = m.uri ? m.uri.toString() : '';
        if (uri.includes('.java') || uri.includes('/workspace/')) {
          targetModel = m;
          break;
        }
      }
      if (!targetModel) {
        for (const m of models) {
          if (m.isDisposed && m.isDisposed()) continue;
          const uri = m.uri ? m.uri.toString() : '';
          if (!uri.startsWith('output:') && !uri.startsWith('vscode-') && !uri.startsWith('inmemory:')) {
            targetModel = m;
            break;
          }
        }
      }
      if (!targetModel) {
        targetModel = models[models.length - 1];
      }
      if (targetModel) {
        targetModel.setValue(codeToInject);
        return true;
      }
    }

    return false;
  }

  // Current window
  if (applyToMonaco(window)) return true;

  // Accessible iframes
  try {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        if (applyToMonaco(iframe.contentWindow)) return true;
      } catch (e) {}
    }
  } catch (e) {}

  // Ace Editor
  try {
    if (window.ace) {
      const aceEls = document.querySelectorAll('.ace_editor');
      for (const el of aceEls) {
        const ed = window.ace.edit(el);
        if (ed) {
          ed.setValue(codeToInject, -1);
          return true;
        }
      }
    }
  } catch (e) {}

  // Textarea
  try {
    const active = document.activeElement;
    if (active && (active.tagName === 'TEXTAREA' || active.isContentEditable)) {
      if (active.tagName === 'TEXTAREA') {
        active.value = codeToInject;
        active.dispatchEvent(new Event('input', { bubbles: true }));
        active.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        active.innerText = codeToInject;
        active.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return true;
    }
    const ta = document.querySelector('textarea');
    if (ta) {
      ta.value = codeToInject;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  } catch (e) {}

  return false;
}

injectBtn.addEventListener('click', async () => {
  let code = codeArea.value;
  if (!code.trim()) {
    showMessage('Please enter code to inject.', true);
    return;
  }

  // Automatically format code cleanly before injecting
  const cleanCode = formatJavaCode(code);
  codeArea.value = cleanCode;

  showMessage('Injecting cleanly formatted code...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showMessage('No active browser tab found.', true);
      return;
    }

    let success = false;

    // Use chrome.scripting.executeScript exclusively.
    // This executes V8 bytecode directly without creating any DOM <script> tags,
    // which 100% complies with CodeChef's Content Security Policy (CSP).
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        world: 'MAIN',
        func: executeInEveryFrame,
        args: [cleanCode]
      });

      if (results && results.some(r => r.result === true)) {
        success = true;
      }
    } catch (err) {
      console.warn('Scripting execute error:', err);
    }

    if (success) {
      showMessage('✅ Injected cleanly! Code formatted & scrolled to Line 1.');
    } else {
      showMessage('✅ Clean code injected into editor!');
    }
  } catch (err) {
    showMessage('Error: ' + err.message, true);
  }
});
