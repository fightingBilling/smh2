Ext.define('Sys.model.OrgModel',{
    extend: 'Ext.data.Model',
    fields: [
        {name : 'id',type:'string'},
        {name : 'orgName',type:'string'},
        {name : 'orgCode',type:'string'},
        {name : 'remark',type:'string'},
        {name : 'sno',type:'int'}
    ],
    autoLoad:true,
    proxy : {
        type: 'ajax',
        url: 'org/getTree',
        reader: {
            root: 'rows'
        }
    }
});

/**
 * 部门或机构查询树
 */
Ext.define('Sys.org.OrgTreePanel',{
    //title:'机构',
    //collapsible : true,
    layoutConfig : {
        animate : true
    },
    rootVisible:false,
    split : true,
    extend:'Ext.tree.Panel',
    initComponent:function(){
        this.store= Ext.create('Ext.data.TreeStore', {
            //nodeParam:'pid',
            autoLoad:true,
            model:'Sys.model.OrgModel',
            folderSort: true,
            root: {
                text: '根节点',
                id:'root',
                expanded: true
            }
        });

        this.columns=[{xtype: 'rownumberer'},{
            text:'机构编号',dataIndex:'orgCode',xtype:'treecolumn',width:300
        },{
            text:'机构名称',dataIndex:'orgName'
        }];
        this.tbar=[{
            text:'新增',
            iconCls:ipe.sty.add,
            scope:this,
            handler:this.addOrg
        },{
            text:'修改',
            iconCls:ipe.sty.edit,
            scope:this,
            handler:this.editOrg
        },{
            text:'删除',
            iconCls:ipe.sty.del,
            scope:this,
            handler:this.delOrg
        }];
        this.callParent();
    },
    addOrg:function(){

    },
    editOrg:function(){

    },
    delOrg:function(){

    }
});

Ext.define('Sys.org.OrgForm',{
    extend:'Ext.form.Panel',
    url:'org/add',
    waitTitle:'请稍候....',
    defaults:{
        anchor:'90%',
        border:'5px'
    },
    frame:true,
    initComponent:function(){
        this.items=[{
            fieldLabel:'机构编码',name:'menuName',xtype:'textfield',allowBlank:false
        },{
            fieldLabel:'机构名称', name:'menuUrl',xtype:'textarea',allowBlank:false
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
            iconCls:ipe.sty.save,
            scope:this,
            handler:this.saveData
        },{
            text:'取消',
            iconCls:ipe.sty.cancel,
            scope:this,
            handler:function(){
                this.getForm().reset();
                this.hide();
            }
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
                        parent.orgTree.getStore().load();
                        me.hide();
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert('提示', action.result.rows);
                    }});
            }else{
                Ext.Msg.alert('提示','必填项未填或输入值不能通过校验!');
            }
        }else if(this.oper=='edit'){
            if(me.getForm().isValid()){
                me.getForm().submit({
                    url:'menu/edit',
                    success: function(form, action) {
                        Ext.Msg.alert('提示', '修改成功');
                        parent.orgTree.getStore().load();
                        parent.orgTree.getSelectionModel().deselectAll();
                        me.hide();
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert('提示', '修改失败');
                    }});
            }else{
                Ext.Msg.alert('提示','必填项未填或输入值不能通过校验!');
            }
        }
    }
});


Ext.define('Sys.org.OrgMainPanel',{
    extend:'Ext.Panel',
    layout:{type:'border',align:'stretch'},
    initComponent:function(){
        this.orgTree=Ext.create('Sys.org.OrgTreePanel',{parent:this,region:'center'});
        this.orgForm=Ext.create('Sys.org.OrgForm',{parent:this,hidden:true,split:true,region:'east',width:300});
        this.items=[this.orgTree,this.orgForm];
        this.callParent();
    }
});
