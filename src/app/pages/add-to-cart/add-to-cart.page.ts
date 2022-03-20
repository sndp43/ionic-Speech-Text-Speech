import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CartService } from 'src/app/services/cart/cart.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { TextToSpeechAdvanced } from '@awesome-cordova-plugins/text-to-speech-advanced/ngx';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';

@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.page.html',
  styleUrls: ['./add-to-cart.page.scss'],
})
export class AddToCartPage {

  minOrderQty: any;
  availableQty: any;
  matches:any;
  custInterests:any = ['yes','no'];
  constructor(
    private modalCtrl: ModalController,
    public cart: CartService,
    public utility: UtilityService,
    private tts: TextToSpeechAdvanced,
    private speechRecognition: SpeechRecognition,
  ) {
    this.minOrderQty = 1;
    this.cart.item['cartQuantity'] =  this.minOrderQty;
    this.availableQty  = this.cart.item['totalStock'] || 0;
  }

  ionViewDidEnter(){
        if(this.cart.voiceStatus){

          this.tts.speak({
          text: 'Hello,would you like to add '+this.cart.item.name+" to the cart",
          identifier: 'io.ionic.demo.pg.cap.ng',
          rate: 1.4,
          pitch: 0.9,
          cancel: true
        }).then(function(){},function (reason) {});

          setTimeout(() => {
            this.startListening();
          }, 5000);
      }
  }

  startListening() { 
    // eslint-disable-next-line prefer-const
    let options = {
      language: 'en-US'
    };
    this.speechRecognition.startListening(options).subscribe(matches => {
     
      let filteredMatches = matches.map((match)=>{
        return match.toLowerCase();
      })
      this.matches = filteredMatches;

      if(this.matches.includes('yes')){
        this.tts.speak(this.cart.item.name+' Has been added successfully into the cart');
        this.addToCart();
      }else{
        this.tts.speak('Ok,Cancelling the order for'+this.cart.item.name);
        this.dismiss();
      }
    });
  }

  findTheCustomerInterest(){
    let result = this.custInterests.find((custInterest)=>{
      return this.matches.includes(custInterest.toLowerCase());
    });
    return result ? result : {id:null};
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  increaseQuantity() {
    let itemQty = this.getCartItemQty();
    
    let increasedQty = itemQty + 1;
    if (increasedQty <= this.availableQty) {
      this.cart.item['cartQuantity'] += 1;
    } else {
      this.utility.showToast(`This Stock is not available!`, 'top', 'error');
    }
  }

  decreaseQuantity() {
    let itemQty = this.cart.item['cartQuantity'];

    let decreasedQty = itemQty - 1;
    if (decreasedQty >= this.minOrderQty) {
      this.cart.item['cartQuantity'] -= 1;
    } else {
      this.utility.showToast(`Minimum order quantity is ${this.minOrderQty}`, 'top', 'error');
    }
  }

  getCartItemQty() {
    let index = this.cart.items.findIndex(value => value.id === this.cart.item.id);
    let qty = this.cart.item['cartQuantity'];
    if ( index > -1 ) {
      qty = this.cart.items[index]['cartQuantity'] + this.cart.item['cartQuantity'];
    }
    return qty;
  }

  addToCart() {
    let itemQty = this.getCartItemQty();

    let validOrder = this.availableQty > 0 
      && itemQty <= this.availableQty;
    
    if ( validOrder ) {
      this.cart.addToCart();
      this.modalCtrl.dismiss();
    } else {
      this.utility.showToast('This product is out of stock!', 'top', 'error');
    }
  }


}
