// Generated by `wit-bindgen` 0.21.0. DO NOT EDIT!
// Options used:
pub mod exports {
    pub mod component {
        pub mod backstage_rust_plugin {
            #[allow(clippy::all)]
            pub mod backstage_frontend_plugin {
                #[used]
                #[doc(hidden)]
                #[cfg(target_arch = "wasm32")]
                static __FORCE_SECTION_REF: fn() =
                    super::super::super::super::__link_custom_section_describing_imports;
                use super::super::super::super::_rt;
                /// A representation of a node dependency (one that might be installed via `npm install`/`yarn add`)
                #[derive(Clone)]
                pub struct NodeDependency {
                    /// Name of the dependency (ex. 'react')
                    pub name: _rt::String,
                    /// Version of the dependency
                    pub version: Option<_rt::String>,
                    /// Whether this is a development-only dependency
                    pub dev: bool,
                }
                impl ::core::fmt::Debug for NodeDependency {
                    fn fmt(&self, f: &mut ::core::fmt::Formatter<'_>) -> ::core::fmt::Result {
                        f.debug_struct("NodeDependency")
                            .field("name", &self.name)
                            .field("version", &self.version)
                            .field("dev", &self.dev)
                            .finish()
                    }
                }
                /// Files that make up React components to be used in in the frontend plugin
                #[derive(Clone)]
                pub struct ComponentFile {
                    /// Path to the component file from the (root: `<project>/src/components`)
                    /// ex. MyComponent/
                    pub path: _rt::String,
                    /// Whether this component is the root component for the plugin
                    pub is_root: bool,
                    /// Name of the component (used if this file represents a React component)
                    /// This should be specified if is_root is specified
                    pub component_class_name: Option<_rt::String>,
                    /// Contents of the
                    pub contents: _rt::String,
                }
                impl ::core::fmt::Debug for ComponentFile {
                    fn fmt(&self, f: &mut ::core::fmt::Formatter<'_>) -> ::core::fmt::Result {
                        f.debug_struct("ComponentFile")
                            .field("path", &self.path)
                            .field("is-root", &self.is_root)
                            .field("component-class-name", &self.component_class_name)
                            .field("contents", &self.contents)
                            .finish()
                    }
                }
                #[doc(hidden)]
                #[allow(non_snake_case)]
                pub unsafe fn _export_get_node_deps_cabi<T: Guest>() -> *mut u8 {
                    let result0 = T::get_node_deps();
                    let ptr1 = _RET_AREA.0.as_mut_ptr().cast::<u8>();
                    match result0 {
                        Ok(e) => {
                            *ptr1.add(0).cast::<u8>() = (0i32) as u8;
                            let vec5 = e;
                            let len5 = vec5.len();
                            let layout5 =
                                _rt::alloc::Layout::from_size_align_unchecked(vec5.len() * 24, 4);
                            let result5 = if layout5.size() != 0 {
                                let ptr = _rt::alloc::alloc(layout5).cast::<u8>();
                                if ptr.is_null() {
                                    _rt::alloc::handle_alloc_error(layout5);
                                }
                                ptr
                            } else {
                                {
                                    ::core::ptr::null_mut()
                                }
                            };
                            for (i, e) in vec5.into_iter().enumerate() {
                                let base = result5.add(i * 24);
                                {
                                    let NodeDependency {
                                        name: name2,
                                        version: version2,
                                        dev: dev2,
                                    } = e;
                                    let vec3 = (name2.into_bytes()).into_boxed_slice();
                                    let ptr3 = vec3.as_ptr().cast::<u8>();
                                    let len3 = vec3.len();
                                    ::core::mem::forget(vec3);
                                    *base.add(4).cast::<usize>() = len3;
                                    *base.add(0).cast::<*mut u8>() = ptr3.cast_mut();
                                    match version2 {
                                        Some(e) => {
                                            *base.add(8).cast::<u8>() = (1i32) as u8;
                                            let vec4 = (e.into_bytes()).into_boxed_slice();
                                            let ptr4 = vec4.as_ptr().cast::<u8>();
                                            let len4 = vec4.len();
                                            ::core::mem::forget(vec4);
                                            *base.add(16).cast::<usize>() = len4;
                                            *base.add(12).cast::<*mut u8>() = ptr4.cast_mut();
                                        }
                                        None => {
                                            *base.add(8).cast::<u8>() = (0i32) as u8;
                                        }
                                    };
                                    *base.add(20).cast::<u8>() = (match dev2 {
                                        true => 1,
                                        false => 0,
                                    })
                                        as u8;
                                }
                            }
                            *ptr1.add(8).cast::<usize>() = len5;
                            *ptr1.add(4).cast::<*mut u8>() = result5;
                        }
                        Err(e) => {
                            *ptr1.add(0).cast::<u8>() = (1i32) as u8;
                            let vec6 = (e.into_bytes()).into_boxed_slice();
                            let ptr6 = vec6.as_ptr().cast::<u8>();
                            let len6 = vec6.len();
                            ::core::mem::forget(vec6);
                            *ptr1.add(8).cast::<usize>() = len6;
                            *ptr1.add(4).cast::<*mut u8>() = ptr6.cast_mut();
                        }
                    };
                    ptr1
                }
                #[doc(hidden)]
                #[allow(non_snake_case)]
                pub unsafe fn __post_return_get_node_deps<T: Guest>(arg0: *mut u8) {
                    let l0 = i32::from(*arg0.add(0).cast::<u8>());
                    match l0 {
                        0 => {
                            let l6 = *arg0.add(4).cast::<*mut u8>();
                            let l7 = *arg0.add(8).cast::<usize>();
                            let base8 = l6;
                            let len8 = l7;
                            for i in 0..len8 {
                                let base = base8.add(i * 24);
                                {
                                    let l1 = *base.add(0).cast::<*mut u8>();
                                    let l2 = *base.add(4).cast::<usize>();
                                    _rt::cabi_dealloc(l1, l2, 1);
                                    let l3 = i32::from(*base.add(8).cast::<u8>());
                                    match l3 {
                                        0 => (),
                                        _ => {
                                            let l4 = *base.add(12).cast::<*mut u8>();
                                            let l5 = *base.add(16).cast::<usize>();
                                            _rt::cabi_dealloc(l4, l5, 1);
                                        }
                                    }
                                }
                            }
                            _rt::cabi_dealloc(base8, len8 * 24, 4);
                        }
                        _ => {
                            let l9 = *arg0.add(4).cast::<*mut u8>();
                            let l10 = *arg0.add(8).cast::<usize>();
                            _rt::cabi_dealloc(l9, l10, 1);
                        }
                    }
                }
                #[doc(hidden)]
                #[allow(non_snake_case)]
                pub unsafe fn _export_get_component_files_cabi<T: Guest>() -> *mut u8 {
                    let result0 = T::get_component_files();
                    let ptr1 = _RET_AREA.0.as_mut_ptr().cast::<u8>();
                    match result0 {
                        Ok(e) => {
                            *ptr1.add(0).cast::<u8>() = (0i32) as u8;
                            let vec6 = e;
                            let len6 = vec6.len();
                            let layout6 =
                                _rt::alloc::Layout::from_size_align_unchecked(vec6.len() * 32, 4);
                            let result6 = if layout6.size() != 0 {
                                let ptr = _rt::alloc::alloc(layout6).cast::<u8>();
                                if ptr.is_null() {
                                    _rt::alloc::handle_alloc_error(layout6);
                                }
                                ptr
                            } else {
                                {
                                    ::core::ptr::null_mut()
                                }
                            };
                            for (i, e) in vec6.into_iter().enumerate() {
                                let base = result6.add(i * 32);
                                {
                                    let ComponentFile {
                                        path: path2,
                                        is_root: is_root2,
                                        component_class_name: component_class_name2,
                                        contents: contents2,
                                    } = e;
                                    let vec3 = (path2.into_bytes()).into_boxed_slice();
                                    let ptr3 = vec3.as_ptr().cast::<u8>();
                                    let len3 = vec3.len();
                                    ::core::mem::forget(vec3);
                                    *base.add(4).cast::<usize>() = len3;
                                    *base.add(0).cast::<*mut u8>() = ptr3.cast_mut();
                                    *base.add(8).cast::<u8>() = (match is_root2 {
                                        true => 1,
                                        false => 0,
                                    })
                                        as u8;
                                    match component_class_name2 {
                                        Some(e) => {
                                            *base.add(12).cast::<u8>() = (1i32) as u8;
                                            let vec4 = (e.into_bytes()).into_boxed_slice();
                                            let ptr4 = vec4.as_ptr().cast::<u8>();
                                            let len4 = vec4.len();
                                            ::core::mem::forget(vec4);
                                            *base.add(20).cast::<usize>() = len4;
                                            *base.add(16).cast::<*mut u8>() = ptr4.cast_mut();
                                        }
                                        None => {
                                            *base.add(12).cast::<u8>() = (0i32) as u8;
                                        }
                                    };
                                    let vec5 = (contents2.into_bytes()).into_boxed_slice();
                                    let ptr5 = vec5.as_ptr().cast::<u8>();
                                    let len5 = vec5.len();
                                    ::core::mem::forget(vec5);
                                    *base.add(28).cast::<usize>() = len5;
                                    *base.add(24).cast::<*mut u8>() = ptr5.cast_mut();
                                }
                            }
                            *ptr1.add(8).cast::<usize>() = len6;
                            *ptr1.add(4).cast::<*mut u8>() = result6;
                        }
                        Err(e) => {
                            *ptr1.add(0).cast::<u8>() = (1i32) as u8;
                            let vec7 = (e.into_bytes()).into_boxed_slice();
                            let ptr7 = vec7.as_ptr().cast::<u8>();
                            let len7 = vec7.len();
                            ::core::mem::forget(vec7);
                            *ptr1.add(8).cast::<usize>() = len7;
                            *ptr1.add(4).cast::<*mut u8>() = ptr7.cast_mut();
                        }
                    };
                    ptr1
                }
                #[doc(hidden)]
                #[allow(non_snake_case)]
                pub unsafe fn __post_return_get_component_files<T: Guest>(arg0: *mut u8) {
                    let l0 = i32::from(*arg0.add(0).cast::<u8>());
                    match l0 {
                        0 => {
                            let l8 = *arg0.add(4).cast::<*mut u8>();
                            let l9 = *arg0.add(8).cast::<usize>();
                            let base10 = l8;
                            let len10 = l9;
                            for i in 0..len10 {
                                let base = base10.add(i * 32);
                                {
                                    let l1 = *base.add(0).cast::<*mut u8>();
                                    let l2 = *base.add(4).cast::<usize>();
                                    _rt::cabi_dealloc(l1, l2, 1);
                                    let l3 = i32::from(*base.add(12).cast::<u8>());
                                    match l3 {
                                        0 => (),
                                        _ => {
                                            let l4 = *base.add(16).cast::<*mut u8>();
                                            let l5 = *base.add(20).cast::<usize>();
                                            _rt::cabi_dealloc(l4, l5, 1);
                                        }
                                    }
                                    let l6 = *base.add(24).cast::<*mut u8>();
                                    let l7 = *base.add(28).cast::<usize>();
                                    _rt::cabi_dealloc(l6, l7, 1);
                                }
                            }
                            _rt::cabi_dealloc(base10, len10 * 32, 4);
                        }
                        _ => {
                            let l11 = *arg0.add(4).cast::<*mut u8>();
                            let l12 = *arg0.add(8).cast::<usize>();
                            _rt::cabi_dealloc(l11, l12, 1);
                        }
                    }
                }
                pub trait Guest {
                    /// Get node dependencies that need to be installed
                    fn get_node_deps() -> Result<_rt::Vec<NodeDependency>, _rt::String>;
                    /// Get the files that make up the frontend of the component
                    fn get_component_files() -> Result<_rt::Vec<ComponentFile>, _rt::String>;
                }
                #[doc(hidden)]

                macro_rules! __export_component_backstage_rust_plugin_backstage_frontend_plugin_cabi{
      ($ty:ident with_types_in $($path_to_types:tt)*) => (const _: () = {

        #[export_name = "component:backstage-rust-plugin/backstage-frontend-plugin#get-node-deps"]
        unsafe extern "C" fn export_get_node_deps() -> *mut u8 {
          $($path_to_types)*::_export_get_node_deps_cabi::<$ty>()
        }
        #[export_name = "cabi_post_component:backstage-rust-plugin/backstage-frontend-plugin#get-node-deps"]
        unsafe extern "C" fn _post_return_get_node_deps(arg0: *mut u8,) {
          $($path_to_types)*::__post_return_get_node_deps::<$ty>(arg0)
        }
        #[export_name = "component:backstage-rust-plugin/backstage-frontend-plugin#get-component-files"]
        unsafe extern "C" fn export_get_component_files() -> *mut u8 {
          $($path_to_types)*::_export_get_component_files_cabi::<$ty>()
        }
        #[export_name = "cabi_post_component:backstage-rust-plugin/backstage-frontend-plugin#get-component-files"]
        unsafe extern "C" fn _post_return_get_component_files(arg0: *mut u8,) {
          $($path_to_types)*::__post_return_get_component_files::<$ty>(arg0)
        }
      };);
    }
                #[doc(hidden)]
                pub(crate) use __export_component_backstage_rust_plugin_backstage_frontend_plugin_cabi;
                #[repr(align(4))]
                struct _RetArea([::core::mem::MaybeUninit<u8>; 12]);
                static mut _RET_AREA: _RetArea = _RetArea([::core::mem::MaybeUninit::uninit(); 12]);
            }
        }
    }
}
mod _rt {
    pub use alloc_crate::alloc;
    pub use alloc_crate::string::String;
    pub unsafe fn cabi_dealloc(ptr: *mut u8, size: usize, align: usize) {
        if size == 0 {
            return;
        }
        let layout = alloc::Layout::from_size_align_unchecked(size, align);
        alloc::dealloc(ptr as *mut u8, layout);
    }
    pub use alloc_crate::vec::Vec;
    extern crate alloc as alloc_crate;
}

/// Generates `#[no_mangle]` functions to export the specified type as the
/// root implementation of all generated traits.
///
/// For more information see the documentation of `wit_bindgen::generate!`.
///
/// ```rust
/// # macro_rules! export{ ($($t:tt)*) => (); }
/// # trait Guest {}
/// struct MyType;
///
/// impl Guest for MyType {
///     // ...
/// }
///
/// export!(MyType);
/// ```
#[allow(unused_macros)]
#[doc(hidden)]

macro_rules! __export_plugin_impl {
  ($ty:ident) => (self::export!($ty with_types_in self););
  ($ty:ident with_types_in $($path_to_types_root:tt)*) => (
  $($path_to_types_root)*::exports::component::backstage_rust_plugin::backstage_frontend_plugin::__export_component_backstage_rust_plugin_backstage_frontend_plugin_cabi!($ty with_types_in $($path_to_types_root)*::exports::component::backstage_rust_plugin::backstage_frontend_plugin);
  )
}
#[doc(inline)]
pub(crate) use __export_plugin_impl as export;

#[cfg(target_arch = "wasm32")]
#[link_section = "component-type:wit-bindgen:0.21.0:plugin:encoded world"]
#[doc(hidden)]
pub static __WIT_BINDGEN_COMPONENT_TYPE: [u8; 426] = *b"\
\0asm\x0d\0\x01\0\0\x19\x16wit-component-encoding\x04\0\x07\xad\x02\x01A\x02\x01\
A\x02\x01B\x0d\x01ks\x01r\x03\x04names\x07version\0\x03dev\x7f\x04\0\x0fnode-dep\
endency\x03\0\x01\x01r\x04\x04paths\x07is-root\x7f\x14component-class-name\0\x08\
contentss\x04\0\x0ecomponent-file\x03\0\x03\x01p\x02\x01j\x01\x05\x01s\x01@\0\0\x06\
\x04\0\x0dget-node-deps\x01\x07\x01p\x04\x01j\x01\x08\x01s\x01@\0\0\x09\x04\0\x13\
get-component-files\x01\x0a\x04\x019component:backstage-rust-plugin/backstage-fr\
ontend-plugin\x05\0\x04\x01&component:backstage-rust-plugin/plugin\x04\0\x0b\x0c\
\x01\0\x06plugin\x03\0\0\0G\x09producers\x01\x0cprocessed-by\x02\x0dwit-componen\
t\x070.201.0\x10wit-bindgen-rust\x060.21.0";

#[inline(never)]
#[doc(hidden)]
#[cfg(target_arch = "wasm32")]
pub fn __link_custom_section_describing_imports() {
    wit_bindgen_rt::maybe_link_cabi_realloc();
}
