import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { IconComponent } from '../icons/icons.component';
import { TabItem, TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
  let fixture: ComponentFixture<TabsComponent>;
  let urlSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);

    const router = TestBed.inject(Router);
    urlSpy = spyOnProperty(router, 'url', 'get').and.returnValue('/dashboard');
  });

  it('should render the correct number of tabs', () => {
    const testTabs: TabItem[] = [
      { label: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
      { label: 'Team', link: '/team', icon: 'team' }
    ];

    fixture.componentRef.setInput('tabs', testTabs);
    fixture.detectChanges();

    const tabElements = fixture.nativeElement.querySelectorAll('.tab-item');
    expect(tabElements.length).toBe(testTabs.length);
  });

  it('should render tab labels correctly', () => {
    const testTabs: TabItem[] = [
      { label: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
      { label: 'Team', link: '/team', icon: 'team' }
    ];

    fixture.componentRef.setInput('tabs', testTabs);
    fixture.detectChanges();

    const tabElements = fixture.nativeElement.querySelectorAll('.tab-item');

    expect(tabElements[0].textContent).toContain(testTabs[0].label);
    expect(tabElements[1].textContent).toContain(testTabs[1].label);
  });

  it('should apply active class to the tab matching current URL', () => {
    const testTabs: TabItem[] = [
      { label: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
      { label: 'Team', link: '/team', icon: 'team' }
    ];

    fixture.componentRef.setInput('tabs', testTabs);
    fixture.detectChanges();

    const tabElements = fixture.nativeElement.querySelectorAll('.tab-item');

    expect(tabElements[0].classList.contains('tab-item--active')).toBeTrue();
    expect(tabElements[1].classList.contains('tab-item--active')).toBeFalse();
  });

  it('should update active class when URL changes', () => {
    const testTabs: TabItem[] = [
      { label: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
      { label: 'Team', link: '/team', icon: 'team' }
    ];
    fixture.componentRef.setInput('tabs', testTabs);

    TestBed.inject(Router);
    urlSpy.and.returnValue('/team');
    fixture.detectChanges();

    const tabElements = fixture.nativeElement.querySelectorAll('.tab-item');

    expect(tabElements[0].classList.contains('tab-item--active')).toBeFalse();
    expect(tabElements[1].classList.contains('tab-item--active')).toBeTrue();
  });

  it('should have correct router links', () => {
    const testTabs: TabItem[] = [
      { label: 'Dashboard', link: '/dashboard', icon: 'dashboard' },
      { label: 'Team', link: '/team', icon: 'team' }
    ];
    fixture.componentRef.setInput('tabs', testTabs);
    fixture.detectChanges();

    const tabElements = fixture.nativeElement.querySelectorAll('.tab-item');

    expect(tabElements[0].getAttribute('href')).toBe('/dashboard');
    expect(tabElements[1].getAttribute('href')).toBe('/team');
  });

  it('should pass correct icon name to app-icon', () => {
    const testTabs: TabItem[] = [{ label: 'Settings', link: '/settings', icon: 'gear' }];
    fixture.componentRef.setInput('tabs', testTabs);
    fixture.detectChanges();

    const iconDebugElement = fixture.debugElement.query(By.directive(IconComponent));

    const iconComponentInstance = iconDebugElement.componentInstance;

    expect(iconComponentInstance.name).toBe('gear');
  });
})