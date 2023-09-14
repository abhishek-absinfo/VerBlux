import { LightningElement } from 'lwc';	
import { NavigationMixin } from 'lightning/navigation';
export default class InvoiceTemplatePage1 extends NavigationMixin(LightningElement) {
    value = '';
    page2 = false;
    page1 = true;

    get options() {
        return [
            { label: 'Choose a predefined template from our gallery or clone one of your existing invoice templates', value: 'option1' },
            { label: 'Start off with a blank canvas', value: 'option2' },
        ];
    }


    handleNextTo(event){
        this.page2 = true;
        this.page1 = false;
    }
 
    backHandle(event){
        var detail = event.detail.message;
        if(detail == 'page1'){
            this.page1 = true;
            this.page2 = false;
        }
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
}