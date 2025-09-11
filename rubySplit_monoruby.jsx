app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "ルビ再設定");

function main() {
    if (!app.documents.length || !app.selection.length) return;

    var sel = app.selection[0];
    if (!(sel.hasOwnProperty("characters"))) return;

    var chars = sel.characters;
    var len = chars.length;

    for (var i = 0; i < len; i++) {
        var ch = chars[i];
        if (!ch.rubyString || ch.rubyString === "") continue;

        var rubyText = ch.rubyString;

        // 空白が含まれない場合は処理しない
        if (rubyText.indexOf(" ") === -1 && rubyText.indexOf("　") === -1) {
            continue;
        }

        // --- 同じrubyStringを持つ範囲を特定 ---
        var start = i;
        var end = i;
        while (end + 1 < len && chars[end + 1].rubyString === rubyText) {
            end++;
        }
        var baseLen = end - start + 1; // 基文字数

        // --- 一度削除 ---
        for (var k = start; k <= end; k++) {
            chars[k].rubyType = RubyTypes.GROUP_RUBY;
            chars[k].rubyString = "";
            chars[k].rubyFlag = false;
        }

        // --- 分割 ---
        var rawParts = rubyText.split(/[ 　]+/);
        var parts = [];
        for (var r = 0; r < rawParts.length; r++) {
            if (rawParts[r] !== "") parts.push(rawParts[r]);
        }

        if (parts.length === baseLen && parts.length > 1) {
            // → モノルビ確定
            for (var p = 0; p < parts.length; p++) {
                chars[start + p].rubyType = RubyTypes.GROUP_RUBY;
                chars[start + p].rubyString = parts[p];
                chars[start + p].rubyFlag = true;
            }
        } else {
            // → グループルビ
            var cleanRuby = rubyText.replace(/[ 　]+/g, "");
            for (var k = start; k <= end; k++) {
                chars[k].rubyType = RubyTypes.GROUP_RUBY;
                chars[k].rubyString = cleanRuby;
                chars[k].rubyFlag = true;
            }
        }

        // 次の処理位置を進める
        i = end;
    }
}
