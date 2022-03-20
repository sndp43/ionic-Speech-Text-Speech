import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { NavController,Platform } from '@ionic/angular';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { CartService } from '../services/cart/cart.service';
import { ProductsService } from '../services/products/products.service';
import { AddToCartPage } from '../pages/add-to-cart/add-to-cart.page';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage {
  products: any = [];
  options = {
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: -60,
  };

  categories = {
    slidesPerView: 2.5,
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  matches: String[];
  isRecording = false;

  // eslint-disable-next-line max-len
  constructor(public navCtrl: NavController, 
    private speechRecognition: SpeechRecognition,
    private cd: ChangeDetectorRef,
    public productService: ProductsService,
    public routerOutlet: IonRouterOutlet,
    public modalCtrl: ModalController,
    public cart: CartService,
    private router: Router) {
      this.products = this.productService.products;
      // this.matches = ['regular hot Chicken pizza','regular hot Chicken pizzaadv'];
      // let filteredMatches = this.matches.map((match)=>{
      //   return match.toLowerCase();
      // })
      // this.matches = filteredMatches;
      // let result = this.findTheProductByResults();
      // if(result.id!=null){
      //   this.addToCartModal(this.products[+result.id-1],true);
      // }
      // console.log(result.id);
      // console.log(result);
     }

  ionViewDidEnter(){
    this.getPermission();
  }

  async addToCartModal(item,voiceStatus=false) {
    let isAdded = this.cart.isAddedToCart(item.id);

    if ( !isAdded ) {
      this.cart.placeItem(item);
      this.cart.setVoiceStatus(voiceStatus);
      const modal = await this.modalCtrl.create({
        component: AddToCartPage,
        cssClass: 'add-to-cart-modal',
        presentingElement: this.routerOutlet.nativeEl
      });

      await modal.present();

      await modal.onWillDismiss().then((result) => {
        console.log('result :>> ', result);
      }).catch((err) => {
        console.log('err :>> ', err);
      });

    } else {
      this.router.navigate(['/tabs/tab2']);
    }

  }
  /////////////Speech Rec code start//////////////
  getPermission() {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
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

      let result = this.findTheProductByResults();
      
      if(result.id!=null){
          //this.cart.setVoiceStatus(true);
          this.addToCartModal(this.products[+result.id-1],true);
          this.cd.detectChanges();
      }

    });
    this.isRecording = true;
  }

  findTheProductByResults(){
    let result = this.products.find((product)=>{
      return product.keywords.find((keyword)=>{
         //alert(keyword.toLowerCase());
         return this.matches.includes(keyword.toLowerCase());
      })
    });
    return result ? result : {id:null};
  }
    /////////////Speech Rec code end//////////////
}
