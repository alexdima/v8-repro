define(["require", "exports", "vs/editor/common/modes/languageFeatureRegistry", "vs/editor/common/modes/tokenizationRegistry", "vs/base/common/types"], function (require, exports, languageFeatureRegistry_1, tokenizationRegistry_1, types_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Open ended enum at runtime
     * @internal
     */
    var LanguageId;
    (function (LanguageId) {
        LanguageId[LanguageId["Null"] = 0] = "Null";
        LanguageId[LanguageId["PlainText"] = 1] = "PlainText";
    })(LanguageId = exports.LanguageId || (exports.LanguageId = {}));
    /**
     * @internal
     */
    var LanguageIdentifier = /** @class */ (function () {
        function LanguageIdentifier(language, id) {
            this.language = language;
            this.id = id;
        }
        return LanguageIdentifier;
    }());
    exports.LanguageIdentifier = LanguageIdentifier;
    /**
     * A font style. Values are 2^x such that a bit mask can be used.
     * @internal
     */
    var FontStyle;
    (function (FontStyle) {
        FontStyle[FontStyle["NotSet"] = -1] = "NotSet";
        FontStyle[FontStyle["None"] = 0] = "None";
        FontStyle[FontStyle["Italic"] = 1] = "Italic";
        FontStyle[FontStyle["Bold"] = 2] = "Bold";
        FontStyle[FontStyle["Underline"] = 4] = "Underline";
    })(FontStyle = exports.FontStyle || (exports.FontStyle = {}));
    /**
     * Open ended enum at runtime
     * @internal
     */
    var ColorId;
    (function (ColorId) {
        ColorId[ColorId["None"] = 0] = "None";
        ColorId[ColorId["DefaultForeground"] = 1] = "DefaultForeground";
        ColorId[ColorId["DefaultBackground"] = 2] = "DefaultBackground";
    })(ColorId = exports.ColorId || (exports.ColorId = {}));
    /**
     * A standard token type. Values are 2^x such that a bit mask can be used.
     * @internal
     */
    var StandardTokenType;
    (function (StandardTokenType) {
        StandardTokenType[StandardTokenType["Other"] = 0] = "Other";
        StandardTokenType[StandardTokenType["Comment"] = 1] = "Comment";
        StandardTokenType[StandardTokenType["String"] = 2] = "String";
        StandardTokenType[StandardTokenType["RegEx"] = 4] = "RegEx";
    })(StandardTokenType = exports.StandardTokenType || (exports.StandardTokenType = {}));
    /**
     * Helpers to manage the "collapsed" metadata of an entire StackElement stack.
     * The following assumptions have been made:
     *  - languageId < 256 => needs 8 bits
     *  - unique color count < 512 => needs 9 bits
     *
     * The binary format is:
     * - -------------------------------------------
     *     3322 2222 2222 1111 1111 1100 0000 0000
     *     1098 7654 3210 9876 5432 1098 7654 3210
     * - -------------------------------------------
     *     xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
     *     bbbb bbbb bfff ffff ffFF FTTT LLLL LLLL
     * - -------------------------------------------
     *  - L = LanguageId (8 bits)
     *  - T = StandardTokenType (3 bits)
     *  - F = FontStyle (3 bits)
     *  - f = foreground color (9 bits)
     *  - b = background color (9 bits)
     *
     * @internal
     */
    var MetadataConsts;
    (function (MetadataConsts) {
        MetadataConsts[MetadataConsts["LANGUAGEID_MASK"] = 255] = "LANGUAGEID_MASK";
        MetadataConsts[MetadataConsts["TOKEN_TYPE_MASK"] = 1792] = "TOKEN_TYPE_MASK";
        MetadataConsts[MetadataConsts["FONT_STYLE_MASK"] = 14336] = "FONT_STYLE_MASK";
        MetadataConsts[MetadataConsts["FOREGROUND_MASK"] = 8372224] = "FOREGROUND_MASK";
        MetadataConsts[MetadataConsts["BACKGROUND_MASK"] = 4286578688] = "BACKGROUND_MASK";
        MetadataConsts[MetadataConsts["LANGUAGEID_OFFSET"] = 0] = "LANGUAGEID_OFFSET";
        MetadataConsts[MetadataConsts["TOKEN_TYPE_OFFSET"] = 8] = "TOKEN_TYPE_OFFSET";
        MetadataConsts[MetadataConsts["FONT_STYLE_OFFSET"] = 11] = "FONT_STYLE_OFFSET";
        MetadataConsts[MetadataConsts["FOREGROUND_OFFSET"] = 14] = "FOREGROUND_OFFSET";
        MetadataConsts[MetadataConsts["BACKGROUND_OFFSET"] = 23] = "BACKGROUND_OFFSET";
    })(MetadataConsts = exports.MetadataConsts || (exports.MetadataConsts = {}));
    /**
     * @internal
     */
    var TokenMetadata = /** @class */ (function () {
        function TokenMetadata() {
        }
        TokenMetadata.getLanguageId = function (metadata) {
            return (metadata & 255 /* LANGUAGEID_MASK */) >>> 0 /* LANGUAGEID_OFFSET */;
        };
        TokenMetadata.getTokenType = function (metadata) {
            return (metadata & 1792 /* TOKEN_TYPE_MASK */) >>> 8 /* TOKEN_TYPE_OFFSET */;
        };
        TokenMetadata.getFontStyle = function (metadata) {
            return (metadata & 14336 /* FONT_STYLE_MASK */) >>> 11 /* FONT_STYLE_OFFSET */;
        };
        TokenMetadata.getForeground = function (metadata) {
            return (metadata & 8372224 /* FOREGROUND_MASK */) >>> 14 /* FOREGROUND_OFFSET */;
        };
        TokenMetadata.getBackground = function (metadata) {
            return (metadata & 4286578688 /* BACKGROUND_MASK */) >>> 23 /* BACKGROUND_OFFSET */;
        };
        TokenMetadata.getClassNameFromMetadata = function (metadata) {
            var foreground = this.getForeground(metadata);
            var className = 'mtk' + foreground;
            var fontStyle = this.getFontStyle(metadata);
            if (fontStyle & 1 /* Italic */) {
                className += ' mtki';
            }
            if (fontStyle & 2 /* Bold */) {
                className += ' mtkb';
            }
            if (fontStyle & 4 /* Underline */) {
                className += ' mtku';
            }
            return className;
        };
        TokenMetadata.getInlineStyleFromMetadata = function (metadata, colorMap) {
            var foreground = this.getForeground(metadata);
            var fontStyle = this.getFontStyle(metadata);
            var result = "color: " + colorMap[foreground] + ";";
            if (fontStyle & 1 /* Italic */) {
                result += 'font-style: italic;';
            }
            if (fontStyle & 2 /* Bold */) {
                result += 'font-weight: bold;';
            }
            if (fontStyle & 4 /* Underline */) {
                result += 'text-decoration: underline;';
            }
            return result;
        };
        return TokenMetadata;
    }());
    exports.TokenMetadata = TokenMetadata;
    /**
     * How a suggest provider was triggered.
     */
    var SuggestTriggerKind;
    (function (SuggestTriggerKind) {
        SuggestTriggerKind[SuggestTriggerKind["Invoke"] = 0] = "Invoke";
        SuggestTriggerKind[SuggestTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
        SuggestTriggerKind[SuggestTriggerKind["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
    })(SuggestTriggerKind = exports.SuggestTriggerKind || (exports.SuggestTriggerKind = {}));
    /**
     * A document highlight kind.
     */
    var DocumentHighlightKind;
    (function (DocumentHighlightKind) {
        /**
         * A textual occurrence.
         */
        DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
        /**
         * Read-access of a symbol, like reading a variable.
         */
        DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
        /**
         * Write-access of a symbol, like writing to a variable.
         */
        DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
    })(DocumentHighlightKind = exports.DocumentHighlightKind || (exports.DocumentHighlightKind = {}));
    /**
     * A symbol kind.
     */
    var SymbolKind;
    (function (SymbolKind) {
        SymbolKind[SymbolKind["File"] = 0] = "File";
        SymbolKind[SymbolKind["Module"] = 1] = "Module";
        SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
        SymbolKind[SymbolKind["Package"] = 3] = "Package";
        SymbolKind[SymbolKind["Class"] = 4] = "Class";
        SymbolKind[SymbolKind["Method"] = 5] = "Method";
        SymbolKind[SymbolKind["Property"] = 6] = "Property";
        SymbolKind[SymbolKind["Field"] = 7] = "Field";
        SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
        SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
        SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
        SymbolKind[SymbolKind["Function"] = 11] = "Function";
        SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
        SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
        SymbolKind[SymbolKind["String"] = 14] = "String";
        SymbolKind[SymbolKind["Number"] = 15] = "Number";
        SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
        SymbolKind[SymbolKind["Array"] = 17] = "Array";
        SymbolKind[SymbolKind["Object"] = 18] = "Object";
        SymbolKind[SymbolKind["Key"] = 19] = "Key";
        SymbolKind[SymbolKind["Null"] = 20] = "Null";
        SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
        SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
        SymbolKind[SymbolKind["Event"] = 23] = "Event";
        SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
        SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
    })(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
    /**
     * @internal
     */
    exports.symbolKindToCssClass = (function () {
        var _fromMapping = Object.create(null);
        _fromMapping[SymbolKind.File] = 'file';
        _fromMapping[SymbolKind.Module] = 'module';
        _fromMapping[SymbolKind.Namespace] = 'namespace';
        _fromMapping[SymbolKind.Package] = 'package';
        _fromMapping[SymbolKind.Class] = 'class';
        _fromMapping[SymbolKind.Method] = 'method';
        _fromMapping[SymbolKind.Property] = 'property';
        _fromMapping[SymbolKind.Field] = 'field';
        _fromMapping[SymbolKind.Constructor] = 'constructor';
        _fromMapping[SymbolKind.Enum] = 'enum';
        _fromMapping[SymbolKind.Interface] = 'interface';
        _fromMapping[SymbolKind.Function] = 'function';
        _fromMapping[SymbolKind.Variable] = 'variable';
        _fromMapping[SymbolKind.Constant] = 'constant';
        _fromMapping[SymbolKind.String] = 'string';
        _fromMapping[SymbolKind.Number] = 'number';
        _fromMapping[SymbolKind.Boolean] = 'boolean';
        _fromMapping[SymbolKind.Array] = 'array';
        _fromMapping[SymbolKind.Object] = 'object';
        _fromMapping[SymbolKind.Key] = 'key';
        _fromMapping[SymbolKind.Null] = 'null';
        _fromMapping[SymbolKind.EnumMember] = 'enum-member';
        _fromMapping[SymbolKind.Struct] = 'struct';
        _fromMapping[SymbolKind.Event] = 'event';
        _fromMapping[SymbolKind.Operator] = 'operator';
        _fromMapping[SymbolKind.TypeParameter] = 'type-parameter';
        return function toCssClassName(kind) {
            return _fromMapping[kind] || 'property';
        };
    })();
    /**
     * @internal
     */
    function isResourceFileEdit(thing) {
        return types_1.isObject(thing) && (Boolean(thing.newUri) || Boolean(thing.oldUri));
    }
    exports.isResourceFileEdit = isResourceFileEdit;
    /**
     * @internal
     */
    function isResourceTextEdit(thing) {
        return types_1.isObject(thing) && thing.resource && Array.isArray(thing.edits);
    }
    exports.isResourceTextEdit = isResourceTextEdit;
    // --- feature registries ------
    /**
     * @internal
     */
    exports.ReferenceProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.RenameProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.SuggestRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.SignatureHelpProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.HoverProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.DocumentSymbolProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.DocumentHighlightProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.DefinitionProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.ImplementationProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.TypeDefinitionProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.CodeLensProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.CodeActionProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.DocumentFormattingEditProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.DocumentRangeFormattingEditProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.OnTypeFormattingEditProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.LinkProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.ColorProviderRegistry = new languageFeatureRegistry_1.default();
    /**
     * @internal
     */
    exports.TokenizationRegistry = new tokenizationRegistry_1.TokenizationRegistryImpl();
});
