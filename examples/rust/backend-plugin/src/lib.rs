#[allow(warnings)]
mod bindings;

use crate::bindings::exports::component::backstage_rust_plugin::backstage_backend_plugin::{
    Guest, Route,
};

use crate::bindings::exports::wasi::http::incoming_handler;
use crate::bindings::exports::wasi::http::incoming_handler::{IncomingRequest, ResponseOutparam};
use crate::bindings::wasi::http::types::{Fields, Method, OutgoingBody, OutgoingResponse};

/// The implementations of the contract will
/// hang off of the struct below
struct Component;

impl Guest for Component {
    fn get_routes() -> Result<Vec<Route>, String> {
        return Ok(vec![Route {
            method: "GET".into(),
            path: "/demo".into(),
        }]);
    }
}

impl incoming_handler::Guest for Component {
    fn handle(request: IncomingRequest, response_out: ResponseOutparam) -> () {
        // Read the request path, stripping query if present
        let path = request
            .path_with_query()
            .expect("failed to read incoming request path");
        let path = match path.split_once("?") {
            Some((p, _)) => p,
            None => &path,
        };

        // Start building the response
        let response = OutgoingResponse::new(Fields::new());
        let response_body = response
            .body()
            .expect("failed to start building response body");
        let response_body_w = response_body
            .write()
            .expect("failed to get write for response body");

        // Dispatch the request
        let method = request.method();
        match (&method, path) {
            // GET /demo
            (Method::Get, "/demo") => {
                response_body_w
                    .blocking_write_and_flush(
                        r#"{"status": "success", "message": "hello Kubecon 2024!"}"#.as_bytes(),
                    )
                    .expect("blocking write and flush failed");
            }
            // GET /health
            (Method::Get, "/health") => {
                response_body_w
                    .blocking_write_and_flush(r#"{"status": "ok"}"#.as_bytes())
                    .expect("blocking write and flush failed");
            }
            // * * (catch-all)
            _ => {
                response_body_w
                    .blocking_write_and_flush(
                        format!(r#"{{"status": "error", "message": "invalid method/path combination", "data": {{"method": "{method:?}", "path": "{path}"}}}}"#)
                            .as_bytes(),
                    )
                    .expect("blocking write and flush failed");
            }
        }

        // Finish up the request body
        OutgoingBody::finish(response_body, None).expect("failed to finish outgoing body");
        ResponseOutparam::set(response_out, Ok(response));
    }
}

bindings::export!(Component with_types_in bindings);
