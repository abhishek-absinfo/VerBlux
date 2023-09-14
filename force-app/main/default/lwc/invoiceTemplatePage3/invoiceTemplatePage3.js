import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import saveInvoiceTemplate from "@salesforce/apex/InvoiceTemplateLwcController.saveInvoiceTemplate";
export default class InvoiceTemplatePage3 extends NavigationMixin(LightningElement) {
    @api templatename;

    handleBack(event){
        this.dispatchEvent(new CustomEvent('goback', {
            detail: {
                message: 'page2'
            }
        }));
} 

handleCancel() {
    this[NavigationMixin.Navigate]({
        type: 'standard__objectPage',
        attributes: {
            objectApiName: 'Invoice_Template__c',
            actionName: 'list'
        },
        state: {
            filterName: 'Recent'
        },
    });
}

handleSave(event){
    saveInvoiceTemplate({ name: this.templatename, pageSize:'A4', pageOrin:'Vertical'})
          .then((result) => {
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Invoice_Template__c',
                    actionName: 'list'
                },
                state: {
                    filterName: 'Recent'
                },
            });
           
          })
          .catch((error) => {
            
          });
      }
}