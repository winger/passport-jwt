var Strategy = require('../lib/strategy')
    , chai = require('chai')
    , sinon = require('sinon')
    , test_data= require('./testdata');


describe('Strategy', function() {

    var mockVerifier = null;

    before(function() {
        // Replace the JWT Verfier with a stub to capture the value
        // extracted from the request
        mockVerifier = sinon.stub();
        mockVerifier.callsArgWith(3, null, test_data.valid_jwt.payload);
        Strategy.JwtVerifier = mockVerifier;
    });
    
    describe('handling request with JWT in header', function() {
        var strategy;

        before(function(done) {
            strategy = new Strategy({secretOrKey: 'secret'}, function(jwt_payload, next) {
                // Return values aren't important in this case
                return next(null, {}, {});
            });
            
            mockVerifier.reset();           

            chai.passport.use(strategy)
                .success(function(u, i) {
                    done();
                })
                .req(function(req) {
                    req.headers['authorization'] = "JWT " + test_data.valid_jwt.token;
                })
                .authenticate();
        });

        it("verifies the right jwt", function() {
            sinon.assert.calledOnce(mockVerifier);
            expect(mockVerifier.args[0][0]).to.equal(test_data.valid_jwt.token);
        });

    });


    describe('handling request with JWT in body', function() {
         var strategy;

        before(function(done) {
            strategy = new Strategy({secretOrKey: 'secret'}, function(jwt_payload, next) {
                // Return values aren't important in this case
                return next(null, {}, {});
            });
            
            mockVerifier.reset();
           
            chai.passport.use(strategy)
                .success(function(u, i) {
                    done();
                })
                .req(function(req) {
                    req.body = {}
                    req.body.auth_token = test_data.valid_jwt.token;
                })
                .authenticate();
        });


        it("verifies the right jwt", function() {
            sinon.assert.calledOnce(mockVerifier);
            expect(mockVerifier.args[0][0]).to.equal(test_data.valid_jwt.token);
        });


    });


    describe('handling request with NO JWT', function() {

        var info;

        before(function(done) {
            strategy = new Strategy({secretOrKey: 'secret'}, function(jwt_payload, next) {
                // Return values aren't important in this case
                return next(null, {}, {});
            });
            
            mockVerifier.reset();
           
            chai.passport.use(strategy)
                .fail(function(i) {
                    info = i
                    done();
                })
                .req(function(req) {
                    req.body = {}
                })
                .authenticate();
        });


        it("should fail authentication", function() {
            expect(info).to.be.an.object;
            expect(info.message).to.equal("No auth token");
        });


        it('Should not try to verify anything', function() {
            sinon.assert.notCalled(mockVerifier);
        });

    });


});
