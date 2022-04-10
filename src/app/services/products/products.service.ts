import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilityService } from '../utility/utility.service';
import { map, filter, tap } from 'rxjs/operators';
import { Menu } from './menu.model';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private _menus = new BehaviorSubject<Menu[]>([]);
  brands: any = [];
  sizes: any = [];
  
  selectedBrands: any = [];
  selectedSizes: any = [];

  priceRange: PriceRange = {
    lower: 0,
    upper: 5000,
    applied: false
  };

  sort: Sort = {
    latest: false,
    price_lth: false,
    price_htl: false
  };

  items: any = [];
  item: any = {};
  filterItems: any = [];

  cartCount: number = 0;

  listBy: ListBy = {
    nav: false,
    search: false,
    banner: false,
    details: false
  };

  searchTerm: string = '';
  searchIn: string;
  bannerId: string;

  show_result_size: boolean = true;

  bannerImages = [
    {
      imgurl: 'assets/images/slide1.jpg'
    }, {
      imgurl: 'assets/images/slide2.jpg'
    }, {
      imgurl: 'assets/images/slide3.jpg'
    }
  ];

  categories : any = [
    {
      category : 'Veg'
    }, {
      category : 'Non Veg'
    }
  ];

  constructor(
    private modalCtrl: ModalController,
    private utility: UtilityService,
    private http:HttpClient
  ) { 
    
  }
  get menus() {
    return this._menus.asObservable();
  }
  getMenu(){
    return this.http.get('https://showyscafe-default-rtdb.asia-southeast1.firebasedatabase.app/menus.json')
    .pipe(
      map(resData => { 
        const menus = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            menus.push(
              new Menu(
                key,
                resData[key].category,
                resData[key].imgurl,
                resData[key].ingredients,
                resData[key].keywords,
                resData[key].name,
                resData[key].price,
                resData[key].rec,
                resData[key].totalStock
              )
            );
          }
        }
         return menus;
        // return [];
      }),
      tap(menu => {
        this._menus.next(menu);
      })
    );
  }

  searchProducts ( term: string, sort: string = '' ) {
    this.utility.presentLoading('Please wait.!.');

    this.resetItems();
    this.listBy.search = true;

  }

  getProductsByDepartment(department: string, sort: string = '' ) {
    console.log("search product by department :", department);
    this.utility.presentLoading('Loading...');
    // list by and reset all items is in the childcategories page
    

  }

  initProductList(items: any) {
    this.items = items;
    this.filterItems = items;
    
    this.setSizes();
    this.setBrands();
    this.showResultCount();
  }

  applySort ( column, order, type ) {
    this.uncheckSorts();
    
    console.log('type :>> ', type, this.sort);
    //this.utility.presentLoading('Please wait.....');

    if ( this.listBy.banner ) {
      
    } else if ( this.listBy.nav ) {
      this.resetItems();
      this.listBy.nav = true;

      this.getProductsByDepartment(this.searchIn, `&column=${column}&order=${order}`);
    } else if ( this.listBy.search ) {
      this.searchProducts(this.searchIn, `&column=${column}&order=${order}`);
    }

    this.sort[type] = true;

  }

  applyLocalSort ( column, order, type )  {
    this.uncheckSorts();
    this.sort[type] = true;
    console.log('column :>> ', column);
    this.items = this.items.sort((a, b) => {
      console.log('sort :>> ', a, b);
      if ( order === 'desc' ) {
        return a[column] > b[column];
      } else {
        return a[column] < b[column];
      }
      
    })
  }

  applyFilter() {
    console.log(this.selectedBrands, this.selectedSizes, this.priceRange);
    if ( this.selectedBrands.length > 0 || this.selectedSizes.length > 0 || this.priceRange.applied ) {
      console.log('Filter applied :>> ');
      this.items = [];

      for(let i = 0; i < this.filterItems.length; i++) {
        let foundBrand = true, foundSize = true, foundPrice = true;

        if ( this.selectedBrands.length > 0 ) {
          foundBrand = this.selectedBrands.some( val => val.brand.toLocaleLowerCase() === this.filterItems[i]['brand'].toLocaleLowerCase() && val.isChecked);
        }
        
        if ( this.selectedSizes.length > 0 ) {
          foundSize = this.selectedSizes.some( val => val.size == this.filterItems[i]['size'] && val.isChecked);
        }
        
        if ( this.priceRange.applied ) {
          let price = this.filterItems[i]['rsp'];
          price = !price ? this.filterItems[i]['mrp'] : price;
          foundPrice = ( price >= this.priceRange.lower && price <= this.priceRange.upper );
        }
        
        if(foundBrand && foundSize && foundPrice) {
          this.items.push(this.filterItems[i]);
        }
        
      }
    } else {
      console.log('No Filter found:>> ');
      this.items = this.filterItems;
    }
  } 


  showResultCount() {
    this.show_result_size = true;
    setTimeout(() => {
      this.show_result_size = false;
    }, 2000);
  }

  getBrands() {
    let tempBrands = [];
    this.brands = [];
    this.selectedBrands = [];

   
  }
 
  setBrands() {
    let tempBrands = [];
    this.brands = [];
    this.selectedBrands = [];

    this.items.forEach(val => {
      if ( val.brand && !tempBrands.includes(val.brand) ) {
        tempBrands.push(val.brand); 
        this.brands.push({ 
          'isChecked': false, 
          'brand': val.brand 
        });

      }
    });

    console.log('set brands :>> ', this.brands);

  }

  setSizes() {

    let tempSizes = [];
    this.sizes = [];
    this.selectedSizes = [];

    this.items.forEach(val => {
      console.log('val :>> ', val);
      if ( val.size && !tempSizes.includes(val.size) ) {
          tempSizes.push(val.size);

          this.sizes.push({ 'isChecked': false, 'size': val.size });
      }

    });

    console.log('sizes :>> ', this.sizes);

  }

  resetItems() {
    this.items = [];
    this.filterItems = [];

    this.searchIn = '';
    this.searchTerm = '';
    this.uncheckFilters();
    this.uncheckSorts();
    this.defaultListBy();
  } 

  uncheckSorts() {
    this.defaultSorting();
  }

  uncheckFilters() {
    this.selectedBrands = [];
    this.selectedSizes = [];
    this.defaultPriceRange();

    for( let i = 0; i < this.brands.length; i++) {
      this.brands[i].isChecked = false;
    }

    for( let i = 0; i < this.sizes.length; i++) {
      this.sizes[i].isChecked = false;
    }
  }

  defaultPriceRange() {
    this.priceRange = {
      applied:  false,
      lower : 0,
      upper : 5000
    }
    
  }

  defaultSorting() {
    Object.keys(this.sort).forEach(key => {
      this.sort[key] = false;
    })
  }

  defaultListBy() {
    Object.keys(this.listBy).forEach(key => {
      this.listBy[key] = false;
    })
  }

}

interface PriceRange {
  lower: any,
  upper: any,
  applied: boolean
}

interface Sort {
  latest: boolean,
  price_lth: boolean,
  price_htl: boolean
}

interface ListBy {
  search: boolean,
  banner: boolean,
  nav: boolean,
  details: boolean
}

interface MenuData {
   category: string,
   imgurl: string,
   ingredients:string,
   keywords: any,
   name: string,
   price: number,
   rec:number,
   totalStock: number
}