import { LightningElement, api, wire} from 'lwc';
import createBillingRecord from '@salesforce/apex/BillingRecordLwcController.createBillingRecord';
import getTemplateList from '@salesforce/apex/BillingRecordLwcController.getTemplateList';
import fetchContactEmailList from '@salesforce/apex/BillingRecordLwcController.fetchContactEmailList';
import getUser from '@salesforce/apex/BillingRecordLwcController.getUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class billingScenarioLWC extends NavigationMixin(LightningElement) {
    @api isShowModal;
    billingOptionsValue;
    invoicingOptionsValue;
    invoiceOptionsValue;
    ownerName;
    templateReady = false;
    invTemplateOptions =[];
    contactEmailOptions =[];
    showAccountLookup = false;
    showContactLookup = false;
    showOppLookup = false;
    isAccountRecordSelected = false;
    isContactRecordSelected = false;
    isOppRecordSelected = false;
    maxInvoiceNumber = 0;
    invoiceCounterReceived = false;
    showSpinner = false;

    selectedTemplateValue = '';
    _selectedContactEmails = [];
    billingName = '';
    billingDescription = '';
    invoiceCounter = '';
    invoiceTypeValue = '';
    invoiceDate = new Date().toJSON().slice(0, 10);

    connectedCallback() {
        getUser()
        .then(result=>{
           
            this.ownerName = result.user.Name;
            this.invoiceCounterReceived = true;
            this.maxInvoiceNumber = result.maxInvoiceNumber;
            this.invoiceCounter = result.maxInvoiceNumber.toString();
           
        }).catch(error=>{
        });

        getTemplateList()
		.then(result => {
            console.log('result:::'+JSON.stringify(result));
            this.invTemplateOptions =this.generatePicklist(result);
            this.templateReady = true; 
		})
		.catch(error => {
			console.log('error:::'+JSON.stringify(error));
		})
    }

     generatePicklist(data) {
        return data.map(item => ({ "label": item.Name, "value": item.Name}))
    }

    generateEmailOptions(data) {
        return data.map(item => ({"label": item.Email, "value": item.Email}))
    }

    billinghandleChange(e) {
        this.billingOptionsValue = e.detail.value;
    }
   
    get selected() {
        return this._selectedContactEmails.length ? this._selectedContactEmails : 'none';
    }

    get invoicingOptions() {
        return [
            { label: 'Opportunities Invoicing', value: 'Opportunities Invoicing' },
            { label: 'Account Invoicing', value: 'Account Invoicing' },
        ];
    }

    invoicingHandleChange(event) {
        this.invoiceTypeValue = event.detail.value;

    }


    invoicehandleChange(e) {
        this.invoiceOptionsValue = e.detail.value;
    }
   
    handleSaveRecord() {
    console.log('handle Save');

        var billingRecordData = { 
            billingName: this.billingName,
            billingDescription: this.billingDescription,
            invoiceCounter:this.invoiceCounter,
            invoiceTypeValue:this.invoiceTypeValue,
            invoiceDate:this.invoiceDate,
            selectedTemplateValue:this.selectedTemplateValue,
            selectedContactEmails:this._selectedContactEmails,
            maxInvoiceNumber:this.maxInvoiceNumber
         }
         console.log('details:::'+JSON.stringify(billingRecordData));
         createBillingRecord({billingDetails: billingRecordData })
         .then(result=>{
            this.showSpinner = false;
            console.log('Saved Success');
             const evt = new ShowToastEvent({
                title: 'Success!',
                message: 'Record Saved Successfully.',
                variant: 'success',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);

            this.billingName ='';
            this.billingDescription ='';
            this.invoiceTypeValue ='';
            this.selectedTemplateValue ='';
            this._selectedContactEmails =[];
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: result,
                    objectApiName: 'Billing_Record__c', 
                    actionName: 'view'
                }
            });
             
         }).catch(error=>{
 
         });
     }

     handleCancel(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Billing_Record__c',
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            },
        });
     }
     handleINVDateChage(event){
        this.invoiceDate = event.target.value;
     
     }
     handleAccountCheckToEmail(event){
        if(event.target.checked){
            this.showAccountLookup = true;
        }else{
            this.showAccountLookup = false;
        }
       
        
     }
     handleContactCheckToEmail(event){ 
        if(event.target.checked){
            this.showContactLookup = true;
        }else{
            this.showContactLookup = false;
        }
       
        
     }
     handleOppCheckToEmail(event){
        if(event.target.checked){
            this.showOppLookup = true;
        }else{
            this.showOppLookup = false;
        } 
     }

     templateHandleChange(event){
      this.selectedTemplateValue = event.target.value;
     }

     lookupAccountRecord(event){
        if(event.detail.selectedRecord != null || event.detail.selectedRecord != undefined){
           this.isAccountRecordSelected = true;
        }else{
            this.isAccountRecordSelected = false;
        }
        console.log('Selected Record Value on Parent Component is ' +  JSON.stringify(event.detail.selectedRecord));
    }

    lookupContactRecord(event){
        if(event.detail.selectedRecord != null || event.detail.selectedRecord != undefined){
           
        fetchContactEmailList({contId:event.detail.selectedRecord.Id})
		.then(result => {
            this.contactEmailOptions =this.generateEmailOptions(result);
            this.isContactRecordSelected = true;
		})
		.catch(error => {
			console.log('error:::'+JSON.stringify(error));
		})

         }else{
            this.contactEmailOptions =[];
            this.isContactRecordSelected = false;
        }
        console.log('Selected Record Value on Parent Component is ' +  JSON.stringify(event.detail.selectedRecord));
    }

    lookupOppRecord(event){
        if(event.detail.selectedRecord != null || event.detail.selectedRecord != undefined){
            this.isOppRecordSelected = true;
         }else{
            this.isOppRecordSelected = false;
        }
        console.log('Selected Record Value on Parent Component is ' +  JSON.stringify(event.detail.selectedRecord));
    }


    handleBillingName(event){
    this.billingName = event.target.value;
    }
    
    handleDescription(event){
    this.billingDescription = event.target.value;
    }

    handleBillingName(event){
        this.billingName = event.target.value;
        }

    handleInvoiceNunmber(event){
        this.invoiceCounter = event.target.value;
        if(this.maxInvoiceNumber <  parseInt(this.invoiceCounter))
        this.maxInvoiceNumber = parseInt(this.invoiceCounter);
        }

     handleContactEmailChange(event){
        this._selectedContactEmails = event.detail.value;
        console.log('this._selectedContactEmails:::'+JSON.stringify(this._selectedContactEmails));
     }

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
    if(this.handleCheckValidation()){
      this.showSpinner = true;
      this.handleSaveRecord();
    }
}

}