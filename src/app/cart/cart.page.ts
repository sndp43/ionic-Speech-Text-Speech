import { Component } from '@angular/core';
import { CartService } from '../services/cart/cart.service';
import { TextToSpeechAdvanced } from '@awesome-cordova-plugins/text-to-speech-advanced/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage {

  constructor(
    public cart: CartService,
    private tts: TextToSpeechAdvanced,
    private router:Router
  ) {}

  ionViewWillEnter() {
    this.cart.unseen = 0;
    this.cart.getCartTotalQty();
    this.cart.totalPrice();
  }

  placeOrder() {
    this.tts.speak({
      text: 'Order has been placed successfully,Thank you',
      identifier: 'io.ionic.demo.pg.cap.ng',
      rate: 1.4,
      pitch: 0.9,
      cancel: true
    }).then(function(){},function (reason) {});

    
    setTimeout(() => {
      this.cart.resetCart();
      this.router.navigate(['/menu']);
    }, 2000);

  }

}
