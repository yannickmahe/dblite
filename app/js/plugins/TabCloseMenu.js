/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/**
 * @class Ext.ux.TabCloseMenu
 * @extends Object
 * Plugin (ptype = 'tabclosemenu') for adding a close context menu to tabs. Note that the menu respects
 * the closable configuration on the tab. As such, commands like remove others and remove all will not
 * remove items that are not closable.
 *
 * @constructor
 * @param {Object} config The configuration options
 * @ptype tabclosemenu
 */
Ext.ux.TabCloseMenu = Ext.extend(Object, {
    /**
     * @cfg {String} closeTabText
     * The text for closing the current tab. Defaults to <tt>'Close Tab'</tt>.
     */
    closeTabText: 'Close Editor...',

    /**
     * @cfg {String} closeOtherTabsText
     * The text for closing all tabs except the current one. Defaults to <tt>'Close Other Tabs'</tt>.
     */
    closeOtherTabsText: 'Close Other Editors...',

    /**
     * @cfg {Boolean} showCloseAll
     * Indicates whether to show the 'Close All' option. Defaults to <tt>true</tt>.
     */
    showCloseAll: true,

    /**
     * @cfg {String} closeAllTabsText
     * <p>The text for closing all tabs. Defaults to <tt>'Close All Tabs'</tt>.
     */
    closeAllTabsText: 'Close All Tabs',

    constructor : function(config){
		this.editor = config.editor;
        Ext.apply(this, config || {});
    },

    //public
    init : function(tabs){
        this.tabs = tabs;
        tabs.on({
            scope: this,
            contextmenu: this.onContextMenu,
            destroy: this.destroy
        });
    },

    destroy : function(){
        Ext.destroy(this.menu);
        delete this.menu;
        delete this.tabs;
        delete this.active;
    },

    // private
    onContextMenu : function(tabs, item, e){
    	this.editor.tabPanel.activate(item);
        this.active = item;
        var m = this.createMenu(),
            disableAll = true,
            disableOthers = true,
            closeAll = m.getComponent('closeall');

        tabs.items.each(function(){
            if(this.closable){
                disableAll = false;
                if(this != item){
                    disableOthers = false;
                    return false;
                }
            }
        });
        m.getComponent('closeothers').setDisabled(disableOthers);
        if(closeAll){
            closeAll.setDisabled(disableAll);
        }

        e.stopEvent();
        m.showAt(e.getPoint());
    },

    createMenu : function(){
    	var editor = this.editor;
        if(!this.menu){
            var items = [{
                itemId: 'closeothers',
                text: this.closeOtherTabsText,
                iconCls: 'close_other_tabs',
                scope: this,
                handler: this.onCloseOthers
            }, '-', {
    			text:'Save Editor...',
    			iconCls: 'query_page_save',
    			handler: editor.saveCurrentEditor.createDelegate(editor, [false])
    		}, {
    			text:'Save Editor As...',
    			iconCls: 'query_page_save_as',
    			handler: editor.saveCurrentEditorAs.createDelegate(editor, [false])
    		}, '-', {
    			text:'Delete Editor...',
    			iconCls: 'query_page_delete',
    			handler: editor.deleteEditorConfirmation
    		}];
            this.menu = new Ext.menu.Menu({
                items: items
            });
        }
        return this.menu;
    },

    onClose : function(){
        this.tabs.remove(this.active);
    },

    onCloseOthers : function(){
        this.doClose(true);
    },

    onCloseAll : function(){
        this.doClose(false);
    },

    doClose : function(excludeActive) {
        var items = [];
        this.tabs.items.each(function(item){
            if(item.closable){
                if(!excludeActive || item != this.active){
                    items.push(item);
                }
            }
        }, this);
        
        Ext.each(items, function(item) {
        	if(!item.saved) {
        		this.editor.tabPanel.activate(item);
        		item.fireEvent('beforeclose', item);
        		return false;
        	} else {
                this.tabs.remove(item);
        	}
        }, this);

        this.editor.handleEditorChange();
    }
});

Ext.preg('tabclosemenu', Ext.ux.TabCloseMenu);
