import { Title } from '@angular/platform-browser';
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { SecurityService } from './shared/services/security.service';
import { ConfigurationService } from './shared/services/configuration.service';
import { SignalrService } from './shared/services/signalr.service';
import { ToastrService } from 'ngx-toastr';

import { Router, ActivationEnd, NavigationEnd } from '@angular/router';

/*
 * App Component
 * Top Level Component
 */
@Component({
    selector: 'esh-app',
    styleUrls: ['./app.component.scss'],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    Authenticated: boolean = false;
    subscription: Subscription;

    constructor(private titleService: Title,
        private securityService: SecurityService,
        private configurationService: ConfigurationService,
        private signalrService: SignalrService,
        private toastr: ToastrService,
        vcr: ViewContainerRef,
        private router: Router
    ) {
        // TODO: Set Taster Root (Overlay) container
        //this.toastr.setRootViewContainerRef(vcr);
        this.Authenticated = this.securityService.IsAuthorized;
    }

    ngOnInit() {
        console.log('app on init');
        this.subscription = this.securityService.authenticationChallenge$.subscribe(res => this.Authenticated = res);

        //Get configuration from server environment variables:
        console.log('configuration');
        this.configurationService.load();        

        // Sniff page transitions for instana
        let pageName;
        this.router.events.subscribe(event => {
            // Identifies the name of the page. The name of the page
            // is unfortunately not available on the NavigationEnd event, so we have to
            // get it from the the ActivationEnd. The ActivationEnd is the last
            // event in the router chain for which an ActivatedRouteSnapshot is
            // available.
            if (event instanceof ActivationEnd) {
                pageName = undefined;
                if (event.snapshot && event.snapshot.routeConfig && event.snapshot.routeConfig.path) {
                    pageName = event.snapshot.routeConfig.path;
                }
            // Once the navigation finished, report the page name to Instana.
            } else if (event instanceof NavigationEnd && typeof ineum !== 'undefined') {
                console.log('Set page to', pageName);
                ineum('page', pageName);
            }
        });
    }

    public setTitle(newTitle: string) {
        this.titleService.setTitle('eShopOnContainers');        
    }
}
