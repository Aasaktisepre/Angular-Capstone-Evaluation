import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { DataService } from 'src/app/core/data.service';
import { Product } from 'src/app/shared/models/product.mode';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  searchTerm: string = '';
  filteredProducts: Product[] = [];
  products: Product[] = [];
  categories: string[] = ['Electronics', 'Clothing', 'Books', 'SkinCare', 'Health', 'Sports', 'Stationary'];
  selectedCategory: string = '';
  stockAlerts: string[] = [];
  lowStockThreshold: number = 5;
  errorMessage: string | null = null;
  userRole: string = '';

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadUserData();
  }

  loadProducts(): void {
    this.dataService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products.map(product => ({
          ...product,
          availabilityStatus: this.getAvailabilityStatus(product.quantity) || 'Out of Stock'
        }));
        this.applyFilters();
      },
      error: (err: Error) => this.errorMessage = err.message
    });
  }

  loadUserData(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userRole = user.role || 'user';
  }

  applyFilters(): void {
    let tempProducts: Product[] = [...this.products];
    if (this.selectedCategory) {
      tempProducts = tempProducts.filter(product => product.category === this.selectedCategory);
    }
    if (this.searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.filteredProducts = tempProducts;
    this.checkStockAlerts();
  }

  onSearch(event: string): void {
    this.searchTerm = event;
    this.applyFilters();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  viewProduct(id: number | undefined): void {
    if (id !== undefined) {
      this.router.navigate([`/inventory/product-detail/${id}`]);
    } else {
      this.errorMessage = 'Product ID is undefined';
    }
  }

  editProduct(id: number | undefined): void {
    if (id !== undefined) {
      if (this.userRole === 'user') {
        alert('Only admin have the access');
        return;
      }
      const pin = prompt('Enter admin pin (4 digits):');
      if (pin && this.authService.verifyAdminPin(pin)) {
        this.router.navigate([`/inventory/update-product/${id}`]);
      } else {
        alert('Invalid admin pin.');
      }
    } else {
      this.errorMessage = 'Product ID is undefined';
    }
  }

  deleteProduct(productId: number | undefined): void {
    if (productId !== undefined) {
      if (this.userRole === 'user') {
        alert('Only admin have the access');
        return;
      }
      const pin = prompt('Enter admin pin (4 digits):');
      if (pin && this.authService.verifyAdminPin(pin)) {
        this.dataService.deleteProduct(productId).subscribe({
          next: () => this.loadProducts(),
          error: (err: Error) => this.errorMessage = err.message
        });
      } else {
        alert('Invalid admin pin.');
      }
    } else {
      this.errorMessage = 'Product ID is undefined';
    }
  }

  addProduct(): void {
    if (this.userRole === 'user') {
      alert('Only admin have the access');
      return;
    }
    const pin = prompt('Enter admin pin (4 digits):');
    if (pin && this.authService.verifyAdminPin(pin)) {
      this.router.navigate(['/inventory/add-product']);
    } else {
      alert('Invalid admin pin.');
    }
  }

  checkStockAlerts(): void {
    this.stockAlerts = [];
    this.products.forEach(product => {
      if (product.quantity < this.lowStockThreshold) {
        this.stockAlerts.push(`${product.name} is low in stock (${product.quantity} units remaining)`);
      }
    });
    if (this.stockAlerts.length > 0) {
      alert(this.stockAlerts.join('\n'));
    }
  }

  getAvailabilityStatus(quantity: number): string {
    if (quantity > 10) return 'In Stock';
    if (quantity > 0) return 'Low Stock';
    return 'Out of Stock';
  }

  getAvailabilityClass(status: string | undefined): string {
    return status ? status.toLowerCase().replace(' ', '-') : 'out-of-stock';
  }
}