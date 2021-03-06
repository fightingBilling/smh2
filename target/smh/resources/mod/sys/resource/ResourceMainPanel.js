Ext.define('Sys.model.ResourceModel',{
    extend: 'Ext.data.Model',
    fields: [
        {name : 'id',type:'string'},
        {name : 'resourceUrl',type:'string'},
        {name : 'resourceName',type:'string'},
        {name : 'resourceType',type:'string'},
        {name : 'remark',type:'string'},
        {name : 'sno',type:'int'}
    ],
    autoLoad:true,
    proxy : {
        type: 'ajax',
        url: 'resource/getResources',
        reader: {
            root: 'rows'
        }
    }
});

Ext.define('Sys.resource.ResourceTreePanel',{
    //title:'资源列表',
    region:'center',
    extend:'Ext.tree.Panel',
    animate: true,
    rootVisible:false,
    lines:true,
    singleExpand: true,
    useArrows: true,
    /*viewConfig: {
        plugins: {
            ptype: 'treeviewdragdrop',
            containerScroll: true
        }
    },*/
    initComponent:function(){
        this.store= Ext.create('Ext.data.TreeStore', {
            //nodeParam:'pid',
            autoLoad:true,
            model:'Sys.model.ResourceModel',
            folderSort: true,
            root: {
                text: '根节点',
                id:'root',
                expanded: true
            }/*,
            listeners:{
                'beforeload':function(store,oper){
                    var record=oper.node.data;
                    if(record.id!='root'){
                        oper.params.pid=record.id;
                    }
                }
            }*/
        });

        this.columns=[{xtype: 'rownumberer'},{
            text:'资源名称',dataIndex:'resourceName',xtype:'treecolumn',width:300
        },{
            text:'资源类型',dataIndex:'resourceType',renderer:ipe.fuc.resourceDt
        },{
            text:'资源路径',dataIndex:'resourceUrl',width:300
        }];

        this.tbar=[{
            text:'新增',
            iconCls:ipe.sty.add,
            scope:this,
            handler:this.addResource
        },{
            text:'修改',
            iconCls:ipe.sty.edit,
            scope:this,
            handler:this.editResource
        },{
            text:'删除',
            iconCls:ipe.sty.del,
            scope:this,
            handler:this.delResource
        }];

        this.callParent();
    },addResource:function(){
        var me=this;
        var record=this.getSelectionModel().getSelection();
        if(record && record.length>0){
            var parent=this.up();
            parent.resourceForm.expand(true);
            parent.resourceForm.show();
            parent.resourceForm.getForm().reset();
            parent.resourceForm.setTitle("新增资源");
            parent.resourceForm.oper="add";
            parent.resourceForm.setPid(record[0].data.id);
            parent.doLayout();
        }else{
            Ext.Msg.alert('提示','请选择父资源记录!');
        }
    },editResource:function(){
        var me=this;
        var record=this.getSelectionModel().getSelection();
        if(record && record.length>0){
            var parent=this.up();
            parent.resourceForm.expand(true);
            parent.resourceForm.show();
            parent.resourceForm.setTitle("编辑资源");
            parent.resourceForm.oper="edit";
            parent.resourceForm.setData(record[0]);
            parent.resourceForm.setPid(record[0].data.parentId);
            parent.doLayout();
        }else{
            Ext.Msg.alert('提示','请选择要编辑的记录!');
        }
    },delResource:function(){
        var me=this;
        var record=this.getSelectionModel().getSelection();
        if(record && record.length>0){
            if(record[0].data.parentId=="root"){
                Ext.Msg.alert('提示','此节点不能删除');
                return;
            }
            Ext.Msg.show({
                title:'提示',
                msg: '你确认删除此记录?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.Msg.QUESTION,
                scope:this,
                fn:function(bt){
                    if(bt=='yes'){
                        Ext.Ajax.request({
                            url: 'resource/del',
                            params: {
                                ids:record[0].data.id
                            },
                            success: function(response){
                                var resp =Ext.decode(response.responseText) ;
                                if(resp.success){
                                    me.getStore().load();
                                }else{
                                    Ext.Msg.alert('提示',resp.rows);
                                }
                            }
                        });
                    }
                }
            });
        }else{
            Ext.Msg.alert('提示','请选择要删除的记录!');
        }
    },dropNode:function(){
        //TODO
        alert(0);
    }
});


Ext.define('Sys.resource.ResourceForm',{
    extend:'Ext.form.Panel',
    url:'resource/add',
    title:'新增资源',
    waitTitle:'请稍候....',
    defaults:{
        anchor:'98%'
    },
    frame:true,
    plain:true,
    bodyPadding: 5,
    border:false,
    initComponent:function(){
        this.items=[{
            fieldLabel:'资源名称',name:'resourceName',xtype:'textfield',allowBlank:false
        },{
            fieldLabel:'资源类型',name:'resourceType',xtype:'combo',store:ipe.store.resourceStore,originalValue:'1',
            displayField:'value',valueField:'key',hiddenName:'menuType',triggerAction:'all',editable:false,mode:'local'
        },{
            fieldLabel:'资源路径', name:'resourceUrl',xtype:'textarea'
        },{
            fieldLabel:'状态',xtype:'combo',name:'enabled',store:ipe.store.enabledStore,originalValue:'1',
            displayField:'value',valueField:'key',hiddenName:'enabled',triggerAction:'all',editable:false,queryMode:'local'
        },{
            fieldLabel:'备注', name:'remark',xtype:'textarea'
        },{
            name:'id', xtype:'hidden'
        },{
            name:'parent.id', xtype:'hidden'
        },{
            name:'sno', xtype:'hidden'
        }];
        this.buttons=[{
            text:'保存',
            scope:this,
            iconCls:ipe.sty.save,
            handler:this.saveData
        },{
            text:'取消',
            iconCls:ipe.sty.cancel,
            scope:this,
            handler:this.hide
        }];
        this.callParent();
    },setPid:function(data){
        this.getForm().setValues({'parent.id':data});
    },setData:function(record){
        this.loadRecord(record);
    },saveData:function(){
        var me=this;
        var parent=this.up();
        if(this.oper=='add'){
            if(me.getForm().isValid()){
                me.getForm().submit({
                    success: function(form, action) {
                        Ext.Msg.alert('提示', '保存成功');
                        parent.resourceTree.getStore().load();
                        me.hide();
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert('提示', '保存失败');
                    }});
            }
        }else if(this.oper=='edit'){
            if(me.getForm().isValid()){
                me.getForm().submit({
                    url:'resource/edit',
                    success: function(form, action) {
                        Ext.Msg.alert('提示', '修改成功');
                        parent.resourceTree.getStore().load();
                        parent.resourceTree.getSelectionModel().deselectAll();
                        me.hide();
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert('提示', '修改失败<br>'+action.result.rows);
                    }});
            }
        }
    }
});

Ext.define('Sys.resource.ResourceMainPanel',{
    extend:'Ext.Panel',
    layout:'border',
    initComponent:function(){
        this.resourceTree=Ext.create('Sys.resource.ResourceTreePanel',{parent:this,region:'center'});
        this.resourceForm=Ext.create('Sys.resource.ResourceForm',{parent:this,width:400,region:'east',hidden:true,split:true});
        this.items=[this.resourceTree,this.resourceForm];
        this.callParent();
    }
});