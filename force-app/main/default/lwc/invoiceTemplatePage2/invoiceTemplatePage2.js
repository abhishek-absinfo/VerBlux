import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class InvoiceTemplatePage2 extends NavigationMixin(LightningElement) {
    page2 = true;
    page3 = false;
    templatename;
    handleBack(event){
        this.dispatchEvent(new CustomEvent('goback', {
            detail: {
                message: 'page1'
            }
        }));
}
    handleCancel(){
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

handleNextTo(event){
    this.page3 = true;
    this.page2 = false;
}

backHandle(event){
    var detail = event.detail.message;
    if(detail == 'page2'){
        this.page2 = true;
        this.page3 = false;
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
handleInput(event){
 this.templatename = event.target.value;
}

}