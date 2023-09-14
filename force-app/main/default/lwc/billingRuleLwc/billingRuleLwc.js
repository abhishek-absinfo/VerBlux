import { LightningElement, track, api, wire } from 'lwc';
import getObjectFieldsLabel from'@salesforce/apex/BillingRuleLwcController.getObjectFieldsLabel';
import createBillingRule from'@salesforce/apex/BillingRuleLwcController.createBillingRule';
import getBillingRuleRecords from'@salesforce/apex/BillingRuleLwcController.getBillingRuleRecords';
import getPicklistValues from'@salesforce/apex/BillingRuleLwcController.getPicklistValues';
import deleteBillingRule from'@salesforce/apex/BillingRuleLwcController.deleteBillingRule';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Rule Type', fieldName: 'RuleType__c' },
    { label: 'Field Label', fieldName: 'Field_Label__c'},
    { label: 'Operator', fieldName: 'Operator__c'},
    { label: 'Value', fieldName: 'Value__c'},
    { label: 'Variable', fieldName: 'Variable__c'}
];

export default class BillingRuleLwc extends LightningElement {
    @api recordId;
    fixedWidth = "width:8rem;";
    ruleCount = 0; 
    isOppProductRule = false;
    isOppRule = false;
    OppProductRuleFieldList = [];
    OppRuleFieldList = [];
    labels = [];
    @track billRuledata =[];
    columns = columns;
    isModalOpen = false;
    isEditRuleShowModal = false;
    rowToEdit;
    recordToSaveAfterEdit={};
    operatorEditOptions = [];
    openOpportunityRule= false;
    billingRuleType;
    _selected = [];
    showSpinner = false;
    isLookup = false;
    is2ndLookup = false;
    lookupOptions =[];
    isNotLookup = false;
    isNot2ndLookup = false;
    isNot3rdLookup = false;
    selectedField;
    selectedObject = '';
    showSelectedFormula = false;
    inputFieldValue;
    selectedOperatorValue;
    duallistoptions = [];
    operatorOptions = [];
    addSelectedField;
    formulaFieldToAdd = [];
    @track index =0;
    otherfieldDataType;
    inputDataListToSave = [];
    operatorValue;
    isVariable = false;
    isDuplicateField = false;
    lookup2ndOptions = [];
    inputOppDataListToSave = [];
    inputOppProdDataListToSave = [];
    
    fieldDataType;
    fieldDataTypeOther = false;
    fieldDataTypeBoolean = false;
    fieldDateTypePicklist = false;
    fieldDataTypeDate = false;
    disablePickOptions = false;
    fieldDataTypeDateTime = false;

    pickValueOptions = [];
    editPickValueOptions = [];
    selectedPickValue;

    connectedCallback() {
        getBillingRuleRecords({parentBillRuleId:this.recordId})
        .then(result=>{
            console.log('billRuledata:::'+JSON.stringify(result));
            this.billRuledata = result;
            this.ruleCount = result.length;
        }).catch(error=>{
            console.log('error:::'+JSON.stringify(error));
        });
    }

    get selected() {
        return this._selected.length ? this._selected : 'none';
    }

    handleChange(e) {
        this._selected = e.detail.value;
    }
    
    get options() {
        return [
                 { label: 'Opportunity Rule', value: 'Opportunity Rule' },
                 { label: 'Opportunity Product Rule', value: 'Opportunity Product Rule' }
               ];
    }

    handleNewButton(event){
    this.isModalOpen = true;
    }
    closeModal(event){
    this.index = 0;
    this.formulaFieldToAdd = [];
    this.duallistoptions = [];
    this.isModalOpen = false;
    this.openOpportunityRule = false;
    this.showSelectedFormula = false;
    this.billingRuleType = '';
    this.inputDataListToSave = [];
    this.isLookup = false;
    this.is2ndLookup = false;
    this.isNotLookup = false;
    this.isNot2ndLookup = false;

    }
    
    handleRuleChange(event){
    //    this.showSelectedFormula = false;
        this.billingRuleType = event.detail.value;
        this.showSpinner = true;
     //   this.inputDataListToSave = [];
     //   this.formulaFieldToAdd = [];
     //   this.index = 0
        
        if(this.billingRuleType == 'Opportunity Rule'){
            this.isNot3rdLookup= false;
            this.isLookup = false;
            this.is2ndLookup = false;
            this.isNotLookup = false;
            this.isNot2ndLookup = false;
            this.selectedObject = 'Opportunity';
            getObjectFieldsLabel({sObjectName:'Opportunity'})
		.then(result => {
             console.log('result:::'+JSON.stringify(result));
            let dataDraft = JSON.parse(JSON.stringify(result));
            dataDraft.forEach(item => {
                if (item.type == 'REFERENCE') {
                    for (let field in item) {
                        item[field] = item[field] + ' >';
                    }
                }
            });
            this.duallistoptions = [...dataDraft];

            this.openOpportunityRule = true;
            this.showSpinner = false;
		})
		.catch(error => {
			console.log('error:::'+JSON.stringify(error));
			this.duallistoptions = undefined;
            this.showSpinner = false;
		})
        }else{
            this.isNot3rdLookup= false;
            this.isLookup = false;
            this.is2ndLookup = false;
            this.isNotLookup = false;
            this.isNot2ndLookup = false;
            this.selectedObject = 'OpportunityLineItem';
            this.showSpinner = true;
            getObjectFieldsLabel({sObjectName:'OpportunityLineItem'})
           .then(result => {
            console.log('result:::'+JSON.stringify(result));
            let dataDraft = JSON.parse(JSON.stringify(result));
            dataDraft.forEach(item => {
                if (item.type == 'REFERENCE') {
                    for (let field in item) {
                        item[field] = item[field] + ' >';
                    }
                }
            });
            this.duallistoptions = [...dataDraft];

            this.openOpportunityRule = true;
            this.showSpinner = false;
           })
           .catch(error => {
               console.log('error:::'+JSON.stringify(error));
               this.duallistoptions = undefined;
               this.showSpinner = false;
           })
        }
    }
   // Billing Rule Table Start
     
    //FOR HANDLING THE HORIZONTAL SCROLL OF TABLE MANUALLY
    tableOuterDivScrolled(event) {
        this._tableViewInnerDiv = this.template.querySelector(".tableViewInnerDiv");
        if (this._tableViewInnerDiv) {
            if (!this._tableViewInnerDivOffsetWidth || this._tableViewInnerDivOffsetWidth === 0) {
                this._tableViewInnerDivOffsetWidth = this._tableViewInnerDiv.offsetWidth;
            }
            this._tableViewInnerDiv.style = 'width:' + (event.currentTarget.scrollLeft + this._tableViewInnerDivOffsetWidth) + "px;" + this.tableBodyStyle;
        }
        this.tableScrolled(event);
    }
 
    tableScrolled(event) {
        if (this.enableInfiniteScrolling) {
            if ((event.target.scrollTop + event.target.offsetHeight) >= event.target.scrollHeight) {
                this.dispatchEvent(new CustomEvent('showmorerecords', {
                    bubbles: true
                }));
            }
        }
        if (this.enableBatchLoading) {
            if ((event.target.scrollTop + event.target.offsetHeight) >= event.target.scrollHeight) {
                this.dispatchEvent(new CustomEvent('shownextbatch', {
                    bubbles: true
                }));
            }
        }
    }
 
    //#region ***************** RESIZABLE COLUMNS *************************************/
    handlemouseup(e) {
        this._tableThColumn = undefined;
        this._tableThInnerDiv = undefined;
        this._pageX = undefined;
        this._tableThWidth = undefined;
    }
 
    handlemousedown(e) {
        if (!this._initWidths) {
            this._initWidths = [];
            let tableThs = this.template.querySelectorAll("table thead .dv-dynamic-width");
            tableThs.forEach(th => {
                this._initWidths.push(th.style.width);
            });
        }
 
        this._tableThColumn = e.target.parentElement;
        this._tableThInnerDiv = e.target.parentElement;
        while (this._tableThColumn.tagName !== "TH") {
            this._tableThColumn = this._tableThColumn.parentNode;
        }
        while (!this._tableThInnerDiv.className.includes("slds-cell-fixed")) {
            this._tableThInnerDiv = this._tableThInnerDiv.parentNode;
        }
        console.log("handlemousedown this._tableThColumn.tagName => ", this._tableThColumn.tagName);
        this._pageX = e.pageX;
 
        this._padding = this.paddingDiff(this._tableThColumn);
 
        this._tableThWidth = this._tableThColumn.offsetWidth - this._padding;
        console.log("handlemousedown this._tableThColumn.tagName => ", this._tableThColumn.tagName);
    }
 
    handlemousemove(e) {
        console.log("mousemove this._tableThColumn => ", this._tableThColumn);
        if (this._tableThColumn && this._tableThColumn.tagName === "TH") {
            this._diffX = e.pageX - this._pageX;
 
            this.template.querySelector("table").style.width = (this.template.querySelector("table") - (this._diffX)) + 'px';
 
            this._tableThColumn.style.width = (this._tableThWidth + this._diffX) + 'px';
            this._tableThInnerDiv.style.width = this._tableThColumn.style.width;
 
            let tableThs = this.template.querySelectorAll("table thead .dv-dynamic-width");
            let tableBodyRows = this.template.querySelectorAll("table tbody tr");
            let tableBodyTds = this.template.querySelectorAll("table tbody .dv-dynamic-width");
            tableBodyRows.forEach(row => {
                let rowTds = row.querySelectorAll(".dv-dynamic-width");
                rowTds.forEach((td, ind) => {
                    rowTds[ind].style.width = tableThs[ind].style.width;
                });
            });
        }
    }
 
    handledblclickresizable() {
        let tableThs = this.template.querySelectorAll("table thead .dv-dynamic-width");
        let tableBodyRows = this.template.querySelectorAll("table tbody tr");
        tableThs.forEach((th, ind) => {
            th.style.width = this._initWidths[ind];
            th.querySelector(".slds-cell-fixed").style.width = this._initWidths[ind];
        });
        tableBodyRows.forEach(row => {
            let rowTds = row.querySelectorAll(".dv-dynamic-width");
            rowTds.forEach((td, ind) => {
                rowTds[ind].style.width = this._initWidths[ind];
            });
        });
    }
 
    paddingDiff(col) {
 
        if (this.getStyleVal(col, 'box-sizing') === 'border-box') {
            return 0;
        }
 
        this._padLeft = this.getStyleVal(col, 'padding-left');
        this._padRight = this.getStyleVal(col, 'padding-right');
        return (parseInt(this._padLeft, 10) + parseInt(this._padRight, 10));
 
    }
 
    getStyleVal(elm, css) {
        return (window.getComputedStyle(elm, null).getPropertyValue(css))
    }
   // Billing Rule Table End

   handleOnMenuSelect(event){

   var selectedRow = event.currentTarget;
   var key = selectedRow.dataset.id;
   var recordToEdit = {};

   console.log('Index:::'+JSON.stringify(key));
   console.log('Row index Action:::'+JSON.stringify(this.billRuledata[key]));

    if(event.detail.value == 'editRecord'){

       recordToEdit = this.billRuledata[key];
       this.recordToSaveAfterEdit = this.billRuledata[key];
 
      console.log('recordToEdit:::'+JSON.stringify(recordToEdit));
       
      
       if(recordToEdit.FieldDateType__c == 'STRING' || recordToEdit.FieldDateType__c == 'PICKLIST' || recordToEdit.FieldDateType__c == 'ID'){
        this.operatorEditOptions = [
            { label: '= Equals', value: 'Equals' },
            { label: '<> Not Equals', value: 'Not Equals' },
        ]
      }else if(recordToEdit.FieldDateType__c == 'CURRENCY' || recordToEdit.FieldDateType__c == 'DOUBLE' || recordToEdit.FieldDateType__c == 'PERCENT' || recordToEdit.FieldDateType__c == 'DATE' || recordToEdit.FieldDateType__c=='INTEGER' || recordToEdit.FieldDateType__c == 'DATETIME'){
        this.operatorEditOptions = [
            { label: '= Equals', value: 'Equals' },
            { label: '<> Not Equals', value: 'Not Equals' },
            { label: '< Less Than', value: 'Less Than' },
            { label: '<= Less Than or Equal', value: 'Less Than or Equal'},
            { label: '> Greater Than', value: 'Greater Than' },
            { label: '>= Greater Than or Equal', value: 'Greater Than or Equal'},
        ]
      }
        else if(recordToEdit.FieldDateType__c == 'BOOLEAN'){
        this.operatorEditOptions = [
            { label: '= Equals', value: 'Equals' },
        ]
    }
      
      console.log('Operator Option:::'+JSON.stringify(this.operatorEditOptions));
      console.log('After Edit Operator:::'+ recordToEdit.FieldDateType__c);

       if(recordToEdit.FieldDateType__c == 'DATE'){
        recordToEdit = Object.assign({isDateType: true}, recordToEdit);
      
       }else if(recordToEdit.FieldDateType__c != 'PICKLIST' && recordToEdit.FieldDateType__c != 'REFERENCE' && recordToEdit.FieldDateType__c != 'BOOLEAN' && recordToEdit.FieldDateType__c != 'DATE' && recordToEdit.FieldDateType__c != 'DATETIME'){
        recordToEdit = Object.assign({isOtherType: true}, recordToEdit);
       
       }else if(recordToEdit.FieldDateType__c == 'DATETIME'){
        recordToEdit = Object.assign({isDateTimeType: true}, recordToEdit);
      
       }else if(recordToEdit.FieldDateType__c == 'BOOLEAN'){
        recordToEdit = Object.assign({isBooleanType: true}, recordToEdit);
       }else if(recordToEdit.FieldDateType__c == 'PICKLIST'){
        recordToEdit = Object.assign({isPickListType: true}, recordToEdit);
       }

       if(recordToEdit.FieldDateType__c == 'PICKLIST'){

        console.log('objectName:::'+recordToEdit.Field_Label__c);
        var objectName;
        if(recordToEdit.Field_Label__c.includes('.')){
        objectName = recordToEdit.Field_Label__c.substring(0, recordToEdit.Field_Label__c.indexOf('.'));
        }else{
        objectName = (recordToEdit.RuleType__c == 'Opportunity') ? "Opportunity" : "OpportunityLineItem";
        }
        
        console.log('objectName:::'+objectName);

        const fieldName = recordToEdit.Field_Label__c.split('.').pop();

        getPicklistValues({ObjectApiName: objectName, FieldApiName:fieldName})
                    .then(result=>{
                        console.log('pickresult:::'+JSON.stringify(result));
                        this.editPickValueOptions = result;
                    }).catch(error=>{
                        console.log('error:::'+JSON.stringify(error));
                    });
      }


      this.rowToEdit = recordToEdit;
      console.log('rowToEdit:::'+JSON.stringify(this.rowToEdit))
      this.isEditRuleShowModal = true;
       
    }else{

       var arrNew1 = [...this.billRuledata];
       var recToDelete = arrNew1[key];
        if(arrNew1.length > 1){
           arrNew1.splice(key, 1);
        }else if(arrNew1.length == 1){
            arrNew1 = [];
        }
        
        this.billRuledata = [...arrNew1];
        this.ruleCount = this.billRuledata.length;

     deleteBillingRule({billId: recToDelete.Id})
    .then(result=>{
       const evt = new ShowToastEvent({
           title: 'Delete!',
           message: 'Billing rule deleted successfully',
           variant: 'success',
           mode: 'dismissable'
       });
       this.dispatchEvent(evt);
    })
    .catch(error=>{
       console.log('billing Rule Deletion Error');
    })
    }

   }

   handleEditRuleOperatorChange(event){

    var editObject = { ...this.recordToSaveAfterEdit};
    editObject.Operator__c = event.target.value;
    this.recordToSaveAfterEdit = {...editObject}
    console.log('after save::'+JSON.stringify(this.recordToSaveAfterEdit));
   } 

   handleEditInputChange(event){
    var editObject = { ...this.recordToSaveAfterEdit};
    editObject.Value__c = event.target.value;
    this.recordToSaveAfterEdit = {...editObject}
    console.log('after save Inpput::'+JSON.stringify(this.recordToSaveAfterEdit));

   }

   handleEditRuleInputVariable(event){

    this.template.querySelector('[data-edit="editInput"]').disabled = event.target.checked;
    var editObject = { ...this.recordToSaveAfterEdit};
    editObject.Variable__c =event.target.checked;
    
    if(event.target.checked == true){
    editObject.Value__c = '';
    this.template.querySelector('[data-edit="editInput"]').value = '';
    }
    this.recordToSaveAfterEdit = {...editObject}
    console.log('after save Inpput Var::'+JSON.stringify(this.recordToSaveAfterEdit));

   }

   CloseEditModalBox(event){
    this.isEditRuleShowModal = false;
   }
   
   handleEditCheckValidation() {
    let isValid = true;
    let inputFields = this.template.querySelectorAll('.mandatoryEditfield');
    inputFields.forEach(inputField => {
        if(!inputField.checkValidity()) {
            inputField.reportValidity();
            isValid = false;
        }
    });
    return isValid;
    }
 
    handleEditValidation(event){
    if(this.handleEditCheckValidation()){
    this.SaveEditModalBoxValue();
   }
   }

   SaveEditModalBoxValue(){

    var objToUpdateList = [];
    var objToUpdate = {  billRuleId:this.recordToSaveAfterEdit.Id,
                         rullType:this.recordToSaveAfterEdit.RuleType__c,
                         fieldName: this.recordToSaveAfterEdit.Field_Label__c,
                         value:this.recordToSaveAfterEdit.Value__c,
                         operate:this.recordToSaveAfterEdit.Operator__c,
                         parentBillRecord : this.recordId,
                         isVariable:this.recordToSaveAfterEdit.Variable__c,
                         fieldDataType:this.recordToSaveAfterEdit.FieldDateType__c
                       }

    objToUpdateList.push(objToUpdate);

    createBillingRule({billingRuleDetails: objToUpdateList})
    .then(result=>{
        this.isEditRuleShowModal = false;
       const evt = new ShowToastEvent({
           title: 'Success!',
           message: 'Billing rule have been updated successfully',
           variant: 'success',
           mode: 'dismissable'
       });
       this.dispatchEvent(evt);
       window.location.reload(); 
    })
    .catch(error=>{
       console.log('billing Rule insertion Error');
    })

   console.log('calling Edit Record Save');
   }

  // Billing Rule Edit/Delete Table Function above
    handleTextSelect(event){
    console.log('handleTextSelect1:::'+JSON.stringify(event.target.value))

            this.isNotLookup = false;
            this.is2ndLookup = false;
            this.isNot2ndLookup = false;
            this.isNot3rdLookup= false;

    if(this.selectedObject.includes(".")){
        this.selectedObject = this.selectedObject.substring(0, this.selectedObject.indexOf('.'));   
    }
   
     var apiName = '';
     var isReference = false;
     this.duallistoptions.forEach(item=>{
         if(item.value == event.target.value && item.type == 'REFERENCE >'){
            isReference = true;
            apiName= item.value.substring(0, item.value.length - 4)
         }
    })
    console.log('apiName:::'+apiName);
  
     if(isReference){
        this.showSpinner = true;
        this.selectedObject = this.selectedObject+'.'+apiName;

        getObjectFieldsLabel({sObjectName:apiName})
		.then(result => {
            let dataDraft = JSON.parse(JSON.stringify(result));
            dataDraft.forEach(item => {
                if (item.type == 'REFERENCE') {
                    for (let field in item) {
                        item[field] = item[field] + ' >';
                    }
                }
            });
            this.lookupOptions = [...dataDraft];
            this.showSpinner = false;
            this.isLookup = true;  
		})
		.catch(error => {
			console.log('error:::'+JSON.stringify(error));
			this.lookupOptions = undefined;
            this.showSpinner = false;
            this.isLookup = true;
            this.isNotLookup = false;
            this.isNot3rdLookup= false;
		})
     }else{
        this.isLookup = false;
        this.is2ndLookup = false;
        this.isNot2ndLookup = false;
        this.isNot3rdLookup= false;
        this.isNotLookup = true;
        this.selectedField = event.target.value;
     }
    }    
    
    handleTextSelect2(event){
        console.log('handleTextSelect2:::'+JSON.stringify(event.target.value))
        console.log('this.selectedObject:::'+this.selectedObject);
        
        var occur = this.selectedObject.split(".").length - 1;
        
       if(this.selectedObject.includes(".") && occur >=2){
            this.selectedObject = this.selectedObject.substring(0, this.selectedObject.indexOf('.'));   
        }

         var apiName = '';
         var isReference = false;
         this.lookupOptions.forEach(item=>{
            if(item.value == event.target.value && item.type == 'REFERENCE >'){
                isReference = true;
                apiName= item.value.substring(0, item.value.length - 4)
             }
        })
        
         if(isReference){
            this.showSpinner = true;
            this.selectedObject = this.selectedObject + '.'+apiName;
            console.log('apiNamehandle2:::'+apiName);
            getObjectFieldsLabel({sObjectName:apiName})
            .then(result => {
                this.isNot3rdLookup= false;
                this.isNotLookup = false;
                let dataDraft = JSON.parse(JSON.stringify(result));
                dataDraft.forEach(item => {
                    if (item.type == 'REFERENCE') {
                        for (let field in item) {
                            item[field] = item[field] + ' >';
                        }
                    }
                }); 
                this.lookup2ndOptions = [...dataDraft]; 
                this.showSpinner = false;
                this.is2ndLookup = true;
                
            })
            .catch(error => {
                console.log('error:::'+JSON.stringify(error));
                this.lookupOptions = undefined;
                this.showSpinner = false;
                this.is2ndLookup = true;
                this.isNot2ndLookup = false;
            })
    
         }else{
            this.is2ndLookup = false;
            this.isNot2ndLookup = true;
            this.isNot3rdLookup = false;
            this.selectedField = event.target.value;
            console.log('handleSelect2 selectedField:::'+JSON.stringify(event.target.value));
         }
     }  
       
     handleTextSelect3(event){
           console.log('handleTextSelect3:::'+JSON.stringify(event.target.value))
           this.isNot3rdLookup = true;    
           this.selectedField = event.target.value;
        }

    handleOppOperatorChange(event){
        var selectedRow = event.currentTarget;
        var currindex = selectedRow.dataset.oppkey;
        this.inputOppDataListToSave[currindex].operate = event.target.value;
    }

    handleProdOperatorChange(event){
        var selectedRow = event.currentTarget;
        var currindex = selectedRow.dataset.prodkey;
        this.inputOppProdDataListToSave[currindex].operate = event.target.value;
    }

    handleOppInputVariable(event){
        var selectedRow = event.currentTarget;
        var currindex = selectedRow.dataset.opp;
        this.template.querySelector(`[data-opp="${currindex}"]`).disabled = event.target.checked;  // Disable input if variable is true
        this.inputOppDataListToSave[currindex].isVariable = event.target.checked; 

        if(event.target.checked){
            this.inputOppDataListToSave[currindex].value = '';
            this.template.querySelector(`[data-opp="${currindex}"]`).value = ''; 
        }
    }

    handleOppProdInputVariable(event){
        var selectedRow = event.currentTarget;
        var currindex = selectedRow.dataset.prod;
        this.template.querySelector(`[data-prod="${currindex}"]`).disabled = event.target.checked;  // Disable input if variable is true
        this.inputOppProdDataListToSave[currindex].isVariable = event.target.checked; 

        if(event.target.checked){
        this.template.querySelector(`[data-prod="${currindex}"]`).value = ''; // UI null if variable
        this.inputOppProdDataListToSave[currindex].value = ''; 
        }
    }

    handleFormulaOppInput(event){
        var selectedRow = event.currentTarget;
        var currindex = selectedRow.dataset.opp;
        this.inputOppDataListToSave[currindex].value = event.target.value;
    }

    handleFormulaOppProdInput(event){
        var selectedRow = event.currentTarget;
        var currindex = selectedRow.dataset.prod;
        this.inputOppProdDataListToSave[currindex].value = event.target.value;
    }

    removeOppRow(event){

        var selectedRow = event.currentTarget;
        var currindex = selectedRow.dataset.opp;
        console.log('currindexOP::'+JSON.stringify(currindex));
        var arrObjRemove= this.OppRuleFieldList[currindex];
        console.log('arrObjRemove::'+JSON.stringify(arrObjRemove));

        this.isOppRule = false;

        if(this.OppRuleFieldList.length>1){
            this.OppRuleFieldList.splice(currindex, 1);
            this.inputOppDataListToSave.splice(currindex, 1);
    
            console.log('OppDataListToSave remove'+JSON.stringify(this.inputOppDataListToSave));

      /*      this.OppRuleFieldList.forEach((item, index) =>{
                item.key = index;
            })

            this.inputOppDataListToSave.splice(key, 1);
            this.inputOppDataListToSave.forEach((item, index) =>{
                item.index = index;
            }) */
            this.isOppRule = true;
        }else if(this.OppRuleFieldList.length == 1){
            this.OppRuleFieldList = [];
        //    this.inputOppDataListToSave = [];
            this.isOppRule = false;
        }
    }


    removeOppProdRow(event){

        var selectedRow = event.currentTarget;
        var currindex = selectedRow.dataset.prod;
        console.log('currindexOP::'+JSON.stringify(currindex));
        var arrObjRemove= this.OppProductRuleFieldList[currindex];
        console.log('arrObjRemove::'+JSON.stringify(arrObjRemove));

      //  console.log('OppDataListToSave remove'+JSON.stringify(this.inputOppProdDataListToSave[currindex]));

        this.isOppProductRule = false;

        if(this.OppProductRuleFieldList.length>1){
            this.OppProductRuleFieldList.splice(currindex, 1);
            this.inputOppProdDataListToSave.splice(currindex,1);
            console.log('OppDataListToSave remove'+JSON.stringify(this.inputOppProdDataListToSave[currindex]));

        /*    this.OppProductRuleFieldList.forEach((item, index) =>{
                item.key = index;
            })

            this.inputOppProdDataListToSave.splice(key, 1);
            this.inputOppProdDataListToSave.forEach((item, index) =>{
                item.index = index;
            })*/
            this.isOppProductRule = true;
        }else if(this.OppProductRuleFieldList.length == 1){
            this.OppProductRuleFieldList = [];
         //   this.inputOppProdDataListToSave = [];
            this.isOppProductRule = false;
        }
    }

    handleAddField(event){
    var listFieldLabelList = [];
    this.showSpinner = true;
    this.index++;   
    var i = this.index;

      if(this.selectedObject.includes(".")){
        const lookupObjName = this.selectedObject.slice(this.selectedObject.indexOf('.') + 1);
        this.addSelectedField = lookupObjName+'.'+this.selectedField;
        console.log('lookupObjName::: '+this.addSelectedField);
      }else{
        this.addSelectedField = this.selectedField;
      }
        console.log('isLookup:::'+this.isLookup);
         if(this.isLookup){
            listFieldLabelList = this.lookupOptions;
         }else{
            listFieldLabelList = this.duallistoptions
         }
            listFieldLabelList.forEach(item=>{
            // Input Type
                 if(item.type == 'PICKLIST' && item.value == this.selectedField){
                    this.showSpinner = true;
                    console.log('PicklistType:::'+item.type);
                    this.fieldDataType = item.type;
                    this.fieldDateTypePicklist = true;
                    this.fieldDataTypeBoolean = false;
                    this.fieldDataTypeOther = false;
                    this.fieldDataTypeDateTime = false;
                    this.fieldDataTypeDate = false;
                   
                    getPicklistValues({ObjectApiName: this.selectedObject, FieldApiName:this.selectedField})
                    .then(result=>{
                        console.log('pickresult:::'+JSON.stringify(result));
                        this.pickValueOptions = result;
                        this.showSpinner = false;
                    }).catch(error=>{
                        console.log('error:::'+JSON.stringify(error));
                    });
                 }else if(item.type != 'PICKLIST' && item.type != 'REFERENCE' && item.type != 'BOOLEAN' && item.type != 'DATE' && item.type != 'DATETIME' && item.value == this.selectedField) {
                    console.log('OtherType:::'+item.type);
                    this.fieldDataType = item.type;
                    this.otherfieldDataType = item.type;
                    this.fieldDataTypeOther = true;
                    this.fieldDataTypeBoolean = false;
                 }else if(item.type == 'BOOLEAN' && item.value == this.selectedField){
                    this.fieldDataType = item.type;
                    this.fieldDataTypeBoolean = true;
                    this.fieldDataTypeOther = false;
                    this.fieldDateTypePicklist = false;
                    this.fieldDataTypeDate = false;
                    this.fieldDataTypeDateTime = false;
                 }else if(item.type == 'DATE' && item.value == this.selectedField){
                    this.fieldDataType = item.type;
                    this.fieldDataTypeDate = true;
                    this.fieldDataTypeOther = false;
                    this.fieldDataTypeBoolean = false;
                 }else if(item.type == 'DATETIME' && item.value == this.selectedField){
                    this.fieldDataType = item.type;
                    this.fieldDataTypeDate = false;
                    this.fieldDataTypeOther = false;
                    this.fieldDataTypeBoolean = false;
                    this.fieldDataTypeDateTime = true;
                 }

            // Operator Option Creation
                if(item.value == this.selectedField && (item.type == 'STRING' || item.type == 'PICKLIST' ||  item.type == 'ID')){
                    this.operatorOptions = [
                        { label: '= Equals', value: 'Equals' },
                        { label: '<> Not Equals', value: 'Not Equals' },
                    ]
                }else if(item.value == this.selectedField && (item.type == 'CURRENCY' || item.type == 'DOUBLE' || item.type== 'PERCENT' || item.type == 'DATE' || item.type=='INTEGER' || item.type == 'DATETIME')){
                    this.fieldDataTypeDecimal = true;
                    this.operatorOptions = [
                        { label: '= Equals', value: 'Equals' },
                        { label: '<> Not Equals', value: 'Not Equals' },
                        { label: '< Less Than', value: 'Less Than' },
                        { label: '<= Less Than or Equal', value: 'Less Than or Equal'},
                        { label: '> Greater Than', value: 'Greater Than' },
                        { label: '>= Greater Than or Equal', value: 'Greater Than or Equal'},
                    ]
                }
                else if(item.value == this.selectedField && item.type == 'BOOLEAN'){
                    this.operatorOptions = [
                        { label: '= Equals', value: 'Equals' },
                    ]
                }
                this.showSpinner = false;
           }) 
       // Creating Object to show formula & to save
        console.log('Creating Object to show formula & to save..');
        var fieldDTPicklist = this.fieldDateTypePicklist == true ? true: false
        var fieldDTOther = this.fieldDataTypeOther == true ? true: false
        var fieldDTBoolean = this.fieldDataTypeBoolean == true ? true: false
        var fieldDTDate = this.fieldDataTypeDate == true ? true: false
        var fieldDTDateTime = this.fieldDataTypeDateTime == true ? true: false

        console.log('this.pickValueOptions:::'+JSON.stringify(this.pickValueOptions));
        // Formula Fields to show on UI
       
            var formulaField = {
                billRuleType:this.billingRuleType,
                fieldName:this.addSelectedField, 
                operator: this.operatorOptions,
                fieldDTPicklist: fieldDTPicklist,
                fieldDTOther:fieldDTOther,
                fieldDTBoolean:fieldDTBoolean,
                fieldDTDate:fieldDTDate,
                fieldDTDateTime:fieldDTDateTime,
                key:i-1
               };
              this.formulaFieldToAdd.push(formulaField);
               console.log('formulaFieldToAdd:::'+JSON.stringify(this.formulaFieldToAdd));

         // Fields to Save to database
         var inputDateToSave = {
            index:i-1,
            rullType:this.billingRuleType,
            fieldName: this.addSelectedField,
            value:'',
            operate:'',
            parentBillRecord : this.recordId,
            isVariable:false,
            fieldDataType:this.fieldDataType
           };
           this.inputDataListToSave.push(inputDateToSave);


               if(this.billingRuleType !='Opportunity Rule'){ 
                this.isOppProductRule = true;
                this.formulaFieldToAdd.forEach(item=>{
                  if(item.billRuleType =='Opportunity Product Rule'){
                    this.OppProductRuleFieldList.push(item);
                    // Remove Duplicate
                    this.OppProductRuleFieldList = this.OppProductRuleFieldList.filter((obj, index) => {
                        return index === this.OppProductRuleFieldList.findIndex(o => obj.key === o.key);
                      });
                   console.log('OppProductRuleFieldList:::'+JSON.stringify(this.OppProductRuleFieldList));
                  }
                })  
                this.inputDataListToSave.forEach(item=>{
                    if(item.rullType == 'Opportunity Product Rule'){
                        this.inputOppProdDataListToSave.push(item);
                         // Remove Duplicate
                        this.inputOppProdDataListToSave = this.inputOppProdDataListToSave.filter((obj, index) => {
                            return index === this.inputOppProdDataListToSave.findIndex(o => obj.index === o.index);
                          });
                    }
                })
  
              }else {
                this.isOppRule = true;
                this.formulaFieldToAdd.forEach(item=>{
                  if(item.billRuleType =='Opportunity Rule'){
                      this.OppRuleFieldList.push(item);
                      this.OppRuleFieldList = this.OppRuleFieldList.filter((obj, index) => {
                        return index === this.OppRuleFieldList.findIndex(o => obj.key === o.key);
                      });
                      console.log('OppRuleFieldList:::'+JSON.stringify(this.OppRuleFieldList));
                  }
                })

                this.inputDataListToSave.forEach(item=>{
                    if(item.rullType == 'Opportunity Rule'){
                        this.inputOppDataListToSave.push(item);
                        this.inputOppDataListToSave = this.inputOppDataListToSave.filter((obj, index) => {
                            return index === this.inputOppDataListToSave.findIndex(o => obj.index === o.index);
                          });
                    }
                })
              }
              this.showSelectedFormula = true;
        }

        handleCancelField1(event){
            console.log('First Cancel');
            this.isNotLookup = false;
            this.isNot3rdLookup = false;
        }

        handleCancelField2(event){
            console.log('Second Cancel');
            //this.is2ndLookup = false;
            this.isNot2ndLookup = false;
        }

        handleCancelField3(event){
            console.log('Third Cancel');
            this.isNot3rdLookup = false;
        }

      submitAndSaveDetails(event){
        console.log('Opp:::'+JSON.stringify(this.inputOppDataListToSave));
        console.log('OppProd:::'+JSON.stringify(this.inputOppProdDataListToSave));

        var allInputDataToSave = [...this.inputOppDataListToSave, ...this.inputOppProdDataListToSave];
    
        allInputDataToSave.forEach(object => {
            object.billId = '';
            delete object['index'];
          });

            console.log('DataToSave:::'+JSON.stringify(allInputDataToSave));
           
             createBillingRule({billingRuleDetails: allInputDataToSave})
             .then(result=>{
                this.isModalOpen = false;
                const evt = new ShowToastEvent({
                    title: 'Success!',
                    message: 'Billing rules have been created successfully',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
                 window.location.reload(); // Reload the whole page
             })
             .catch(error=>{
                this.isModalOpen = false;
                console.log('billing Rule insertion Error');
             })
        }

     /*   removeRow(event){ 
            console.log('Remove row');
            var selectedRow = event.currentTarget;
            var currindex = selectedRow.dataset.key;
            console.log('currindexOP::'+JSON.stringify(currindex));
            var arrObjSave = this.inputDataListToSave[currindex];
            console.log('arrObjToSaveOP::'+JSON.stringify(arrObjSave));



            this.showSelectedFormula = false;
            var selectedRow = event.currentTarget;
            var key = selectedRow.dataset.id;
            console.log('Index to remove:::'+JSON.stringify(key));

            if(this.formulaFieldToAdd.length>1){
                this.formulaFieldToAdd.splice(key, 1);
                this.formulaFieldToAdd.forEach((item, index) =>{
                    item.key = index;
                })

                this.inputDataListToSave.splice(key, 1);
                this.inputDataListToSave.forEach((item, index) =>{
                    item.index = index;
                })
                this.index--;
                this.showSelectedFormula = true;
            }else if(this.accountList.length == 1){
                this.formulaFieldToAdd = [];
                this.inputDataListToSave = [];
                this.index--;
                this.showSelectedFormula = false;
            }
            
            console.log('formulaList After Remove:::'+JSON.stringify(this.formulaFieldToAdd));
            console.log('SaveList After Remove:::'+JSON.stringify(this.inputDataListToSave));
        }*/

        handleCheckValidation() {
            let isValid = true;
            let inputFields = this.template.querySelectorAll('.mandatoryfield');
            inputFields.forEach(inputField => {
                if(!inputField.checkValidity()) {
                    inputField.reportValidity();
                    isValid = false;
                }
            });
            return isValid;
        }
         
        handleValidation(event){
            console.log('OppData:::'+JSON.stringify(this.inputOppDataListToSave));
            console.log('ProdData:::'+JSON.stringify(this.inputOppProdDataListToSave));
        if(this.handleCheckValidation()){
          this.showSpinner = true;
          this.submitAndSaveDetails();
        }
    }
}