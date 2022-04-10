export class Menu {
    constructor(
      public id: string,
      public category: string,
      public imgurl: string,
      public ingredients:string,
      public keywords: any,
      public name: string,
      public price: number,
      public rec:number,
      public totalStock: number
    ) {}
  }