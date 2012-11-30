/*global Ext,  JSLINT, CodeMirror  */

/**
 * @class Ext.ux.panel.CodeMirror
 * @extends Ext.Panel
 * Converts a panel into a code mirror editor with toolbar
 * @constructor
 * 
 * @author Dan Ungureanu - ungureanu.web@gmail.com / http://www.devweb.ro
 * @version 0.1
 */

 // Define a set of code type configurations
Ext.ns('Ext.ux.panel.CodeMirrorConfig');
Ext.apply(Ext.ux.panel.CodeMirrorConfig, {
    cssPath: "app/codemirror/CodeMirror-0.7/css/",
    jsPath: "app/codemirror/CodeMirror-0.7/js/"
});
Ext.apply(Ext.ux.panel.CodeMirrorConfig, {
    parser: {
        defo: { // js code
            parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
            stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "jscolors.css"
        },
        css: {
            parserfile: ["parsecss.js"],
            stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "csscolors.css"
        },
        js: {
            parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
            stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "jscolors.css"
        },
        php: {
            parserfile: ["tokenizephp.js", "parsephp.js"],
            stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "phpcolors.css"
        },
        sql: {
            parserfile: ["parsesql.js"],
            stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "sqlcolors.css"
        },
        html: {
            parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "tokenizephp.js", "parsephp.js", "parsephphtmlmixed.js"],
            stylesheet: [Ext.ux.panel.CodeMirrorConfig.cssPath + "xmlcolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "jscolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "csscolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "phpcolors.css"]
            
        },
        mixed: {
            parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "tokenizephp.js", "parsephp.js", "parsephphtmlmixed.js"],
            stylesheet: [Ext.ux.panel.CodeMirrorConfig.cssPath + "xmlcolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "jscolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "csscolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "phpcolors.css"]
            
        }
    }
});

Ext.ns('Ext.ux.panel.CodeMirror');
Ext.ux.panel.CodeMirror = Ext.extend(Ext.Panel, {
    sourceCode: '/* Default code */',
    initComponent: function() {
        // this property is used to determine if the source content changes
        this.contentChanged = false;
        var oThis = this;
        Ext.apply(this, {
            items: [{
                xtype: 'textarea',
                readOnly: false,
                hidden: true,
                value: this.sourceCode
            }]
        });
        Ext.ux.panel.CodeMirror.superclass.initComponent.apply(this, arguments);
    },
    
    getValue: function() {
    	return this.codeMirrorEditor.getCode();
    },
    
    getSelection: function() {
    	return this.codeMirrorEditor.selection();
    },
    triggerOnSave: function(){
        this.setTitleClass(true);
        var sNewCode = this.codeMirrorEditor.getCode();
        
        Ext.state.Manager.set("edcmr_"+this.itemId+'_lnmbr', this.codeMirrorEditor.currentLine());
        
        this.oldSourceCode = sNewCode;
        this.onSave(arguments[0] || false);
    },
    
    onRender: function() {
        this.oldSourceCode = this.sourceCode;
        Ext.ux.panel.CodeMirror.superclass.onRender.apply(this, arguments);
        // trigger editor on afterlayout
        this.on('afterlayout', this.triggerCodeEditor, this, {
            single: true
        });
        
    },
    
    /** @private */
    triggerCodeEditor: function() {
        //this.codeMirrorEditor;
        var oThis = this;
        var oCmp = this.findByType('textarea')[0];
        var editorConfig = Ext.applyIf(this.codeMirror || {}, {
           height: "100%",
           width: "100%",
           lineNumbers: true,
           textWrapping: false,
           content: oCmp.getValue(),
           indentUnit: 4,
           tabMode: 'shift',
           readOnly: oCmp.readOnly,
           path: Ext.ux.panel.CodeMirrorConfig.jsPath,
           autoMatchParens: true,
           onChange: function() {
               var sCode = oThis.codeMirrorEditor.getCode();
               oCmp.setValue(sCode);
               
               if(oThis.oldSourceCode == sCode){
                   oThis.setTitleClass(true);
               }else{
                   oThis.setTitleClass();
               }
               
           }
       });
        
        var sParserType = oThis.parser || 'defo';
        editorConfig = Ext.applyIf(editorConfig, Ext.ux.panel.CodeMirrorConfig.parser[sParserType]);
        
        this.codeMirrorEditor = new CodeMirror.fromTextArea( Ext.getDom(oCmp.id).id, editorConfig);
    },
    
    setTitleClass: function(){
        //var tabEl = Ext.get(this.ownerCt.getTabEl( this ));
        if(arguments[0] === true){// remove class
            //tabEl.removeClass( "tab-changes" );
            this.contentChanged = false;
        }else{//add class
            //tabEl.addClass( "tab-changes" );
            this.contentChanged = true;
        }
    }
});

Ext.reg('uxCodeMirrorPanel', Ext.ux.panel.CodeMirror);